package com.brandonswright

import com.brandonswright.things.application.config.Injection
import com.brandonswright.things.application.request.RequestHandlingService
import com.brandonswright.things.domain.game.Game
import com.brandonswright.things.infrastructure.websocket.GameWebSocket
import mu.KotlinLogging
import spark.ModelAndView
import spark.Spark.*
import spark.template.jade.JadeTemplateEngine
import spark.Spark.staticFiles

val requestHandlingService: RequestHandlingService = Injection.instance()

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
        ModelAndView(mapOf("message" to "Hello dude", "msgStyle" to "display:none;"), "index")
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

        return@post "{\"gameId\" : \"${newGame.id}\"}"
    })
}
