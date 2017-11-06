package com.brandonswright.things.application.controller

import com.brandonswright.things.application.config.Injection
import com.brandonswright.things.domain.game.GameRepository
import com.brandonswright.things.infrastructure.websocket.GameWebSocket
import com.google.gson.Gson
import mu.KLogging
import spark.ModelAndView
import spark.Spark.*
import spark.template.jade.JadeTemplateEngine

class ReadingController {

    companion object: KLogging()

    val gameRepo: GameRepository = Injection.instance()

    init {
        get("/", { req, res ->
            println(req.cookies())
            return@get ModelAndView(mapOf("message" to "Things App Helper"), "index")
        }, JadeTemplateEngine())

        get("/startPage", { req, res ->
            return@get ModelAndView(HashMap<String, String>(), "start")
        }, JadeTemplateEngine())

        get("/lobbyPage/:gameId/:playerId", { req, res ->
            try {
                val gameId = req.params("gameId")
                val playerId = req.params("playerId")
                val game = gameRepo.findGame(gameId)
                val isCreator = game.isCreator(playerId)

                return@get ModelAndView(mapOf("game" to game, "isCreator" to isCreator), "lobby")
            } catch (e: Exception) {
                logger.error { e }
                throw e
            }
        }, JadeTemplateEngine())

        get("/responsePage/:gameId/:playerId", { req, res ->
            try {
                val gameId = req.params("gameId")
                val playerId = req.params("playerId")
                val game = gameRepo.findGame(gameId)
                val player = game.getPlayerForId(playerId)

                return@get ModelAndView(mapOf("game" to game, "currentPlayer" to player), "response")
            } catch (e: Exception) {
                logger.error { e }
                throw e
            }
        }, JadeTemplateEngine())

        get("/guessingPage/:gameId/:playerId", { req, res ->
            try {
                val gameId = req.params("gameId")
                val playerId = req.params("playerId")
                val game = gameRepo.findGame(gameId)
                val player = game.getPlayerForId(playerId)

                return@get ModelAndView(mapOf("game" to game, "currentPlayer" to player), "guessing")
            } catch (e: Exception) {
                logger.error { e }
                throw e
            }
        }, JadeTemplateEngine())

        get("/game/:gameId", { req, res ->
            val gameId = req.params("gameId")
            try {
                val game = gameRepo.findGame(gameId)
                return@get Gson().toJson(game)
            } catch (e: IllegalArgumentException) {
                return@get "NOT FOUND"
            }
        })

        get("/webSocketAddress", { req, res ->
            return@get GameWebSocket.WEB_SOCKET_ADDRESS
        })
    }
}