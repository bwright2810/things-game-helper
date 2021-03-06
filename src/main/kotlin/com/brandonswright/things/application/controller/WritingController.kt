package com.brandonswright.things.application.controller

import com.brandonswright.things.application.config.Injection
import com.brandonswright.things.application.logger
import com.brandonswright.things.application.request.RequestHandlingService
import com.brandonswright.things.domain.game.Game
import com.brandonswright.things.domain.game.GameRepository
import com.brandonswright.things.domain.game.Response
import com.brandonswright.things.infrastructure.websocket.SessionStore
import com.brandonswright.things.infrastructure.websocket.WebSocketMessageFactory
import com.google.gson.Gson
import mu.KLogging
import spark.Spark.*

class WritingController {

    companion object: KLogging()

    val gameRepo: GameRepository = Injection.instance()
    val requestHandlingService: RequestHandlingService = Injection.instance()
    val sessionStore: SessionStore = Injection.instance()

    init {
        post("/create") { req, res ->
            val playerName = req.queryParams("playerName")
            val playerId = req.queryParams("playerId")

            logger.debug { "Received create request with name $playerName and ID $playerId" }

            if (playerName.isNullOrBlank()) {
                res.status(500)
                return@post "Invalid name: $playerName"
            }

            if (playerId.isNullOrBlank()) {
                res.status(500)
                return@post "Invalid ID: $playerId"
            }

            val newGame: Game = requestHandlingService.handleNewGameRequest(playerName, playerId)

            return@post Gson().toJson(newGame)
        }

        post("/begin") { req, res ->
            try {
                val gameId = req.queryParams("gameId")
                logger.debug { "Received request to begin game $gameId" }

                val game = requestHandlingService.handleBeginRequest(gameId)

                toast(gameId, "Reader is being selected")

                broadcastGame(game)
            } catch (e: Exception) {
                logger.error { e }
                throw e
            }
        }

        post("/pickReader") { req, res ->
            val gameId = req.queryParams("gameId")
            val readerId = req.queryParams("readerId")
            logger.debug { "Reader with id $readerId picked in game $gameId" }

            val game = gameRepo.doAndSave(gameId) { it.pickReader(readerId) }

            val playerName = game.getPlayerNameForId(readerId)
            toast(gameId, "$playerName selected as Reader")

            broadcastGame(game)
        }

        post("/addResponse") { req, res ->
            val gameId = req.queryParams("gameId")
            val playerId = req.queryParams("playerId")
            val responseText = req.queryParams("responseText")
            logger.debug { "Player $playerId in game $gameId responded with: $responseText" }

            val lowerCasedResponse = responseText.toLowerCase()

            val game = gameRepo.doAndSave(gameId) { it.addResponse(playerId, lowerCasedResponse) }

            broadcastGame(game)
        }

        post("/removeResponse") { req, res ->
            val gameId = req.queryParams("gameId")
            val playerId = req.queryParams("playerId")
            logger.debug { "Taking back response for player $playerId in game $gameId" }

            val game = gameRepo.doAndSave(gameId) { it.takeBackResponse(playerId) }

            broadcastGame(game)
        }

        post("/lockResponses") { req, res ->
            val gameId = req.queryParams("gameId")
            logger.debug { "Locking responses for game $gameId" }

            val game = gameRepo.doAndSave(gameId) { it.lockResponses() }

            toast(gameId, "Responses Locked In!")
            broadcastGame(game)
        }

        post("/startGuessing") { req, res ->
            val gameId = req.queryParams("gameId")
            logger.debug { "Starting guessing stage for game $gameId" }

            val game = gameRepo.doAndSave(gameId) { it.startGuessingStage() }

            toast(gameId, "Guessing round started!")
            broadcastGame(game)
        }

        post("/guess") { req, res ->
            val gameId = req.queryParams("gameId")
            val responseId = Integer.valueOf(req.queryParams("responseId"))
            logger.debug { "Guessed response $responseId in game $gameId" }

            val game = gameRepo.doAndSave(gameId) { it.markResponseGuessed(responseId) }

            broadcastGame(game)
        }
    }

    private fun broadcastGame(game: Game) {
        sessionStore.broadcastToGamePlayers(game.id, WebSocketMessageFactory.buildMessageForGame(game))
    }

    private fun toast(gameId: String, toast: String) {
        sessionStore.broadcastToGamePlayers(gameId, "TOAST|$toast")
    }
}