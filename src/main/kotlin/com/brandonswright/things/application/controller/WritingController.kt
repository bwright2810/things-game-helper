package com.brandonswright.things.application.controller

import com.brandonswright.things.application.config.Injection
import com.brandonswright.things.application.logger
import com.brandonswright.things.application.requestHandlingService
import com.brandonswright.things.application.sessionStore
import com.brandonswright.things.domain.game.Game
import com.brandonswright.things.domain.game.GameRepository
import com.brandonswright.things.domain.game.Response
import com.google.gson.Gson
import spark.Spark.*

class WritingController {

    val gameRepo: GameRepository = Injection.instance()

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
            val gameId = req.queryParams("gameId")
            logger.debug { "Received request to begin game $gameId" }

            val game = requestHandlingService.handleBeginRequest(gameId)

            val toast = "Reader is being selected"
            val gameSessions = sessionStore.getAllSessionsForGame(gameId)
            gameSessions.forEach { it.remote.sendString("TOAST|$toast") }

            return@post Gson().toJson(game)
        }

        post("/pickReader") { req, res ->
            val gameId = req.queryParams("gameId")
            val readerId = req.queryParams("readerId")
            logger.debug { "Reader with id $readerId picked in game $gameId" }

            val game = gameRepo.doAndSave(gameId) { it.pickReader(readerId) }

            return@post Gson().toJson(game)
        }

        post("/addResponse") { req, res ->
            val gameId = req.queryParams("gameId")
            val playerId = req.queryParams("playerId")
            val responseText = req.queryParams("responseText")
            logger.debug { "Player $playerId in game $gameId responded with: $responseText" }

            val game = gameRepo.doAndSave(gameId) { it.addResponse(Response(playerId, responseText)) }

            return@post Gson().toJson(game)
        }

        delete("/removeResponse") { req, res ->
            val gameId = req.queryParams("gameId")
            val playerId = req.queryParams("playerId")
            logger.debug { "Taking back response for player $playerId in game $gameId" }

            val game = gameRepo.doAndSave(gameId) { it.takeBackResponse(playerId) }

            return@delete Gson().toJson(game)
        }

        post("/lockResponses") { req, res ->
            val gameId = req.queryParams("gameId")
            logger.debug { "Locking responses for game $gameId" }

            val game = gameRepo.doAndSave(gameId) { it.lockResponses() }

            return@post Gson().toJson(game)
        }

        post("/startGuessing") { req, res ->
            val gameId = req.queryParams("gameId")
            logger.debug { "Starting guessing stage for game $gameId" }

            val game = gameRepo.doAndSave(gameId) { it.startGuessingStage() }

            return@post Gson().toJson(game)
        }

        post("/guess") { req, res ->
            val gameId = req.queryParams("gameId")
            val playerId = req.queryParams("playerId")
            logger.debug { "Guessed response for player $playerId in game $gameId" }

            val game = gameRepo.doAndSave(gameId) { it.markPlayersResponseGuessed(playerId) }

            return@post Gson().toJson(game)
        }
    }
}