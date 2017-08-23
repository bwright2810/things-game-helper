package com.brandonswright.things.application

import com.brandonswright.things.application.config.Injection
import com.brandonswright.things.application.request.RequestHandlingService
import com.brandonswright.things.domain.game.Game
import com.brandonswright.things.infrastructure.websocket.GameWebSocket
import com.brandonswright.things.infrastructure.websocket.SessionStore
import com.google.gson.Gson
import mu.KotlinLogging
import spark.ModelAndView
import spark.Spark.*
import spark.template.jade.JadeTemplateEngine
import spark.Spark.staticFiles

val requestHandlingService: RequestHandlingService = Injection.instance()
val sessionStore: SessionStore = Injection.instance()

val logger = KotlinLogging.logger {}

fun main(args: Array<String>) {

    val isProd = args[0].toBoolean()

    if (!isProd) {
        val projectDir = System.getProperty("user.dir")
        val staticDir = "/public"
        staticFiles.externalLocation(projectDir + staticDir)
    } else {
        staticFiles.location("/public")
    }

    webSocket("/echo", GameWebSocket::class.java)

    get("/", { req, res ->
        ModelAndView(mapOf("message" to "Things App Helper", "msgStyle" to "display:none;"), "index")
    }, JadeTemplateEngine(  ))

    post("/create", { req, res ->
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
    })

    post("/begin", { req, res ->
        val gameId = req.queryParams("gameId")
        logger.debug { "Received request to begin game $gameId" }

        val game = requestHandlingService.handleBeginRequest(gameId)

        val toast = "Reader is being selected"
        val gameSessions = sessionStore.getAllSessionsForGame(gameId)
        gameSessions.forEach { it.remote.sendString("TOAST|$toast")}

        return@post Gson().toJson(game)
    })
}
