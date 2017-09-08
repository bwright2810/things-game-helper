package com.brandonswright.things.application

import com.brandonswright.things.application.config.Injection
import com.brandonswright.things.application.controller.ReadingController
import com.brandonswright.things.application.controller.WritingController
import com.brandonswright.things.application.request.RequestHandlingService
import com.brandonswright.things.domain.game.GameRepository
import com.brandonswright.things.infrastructure.websocket.GameWebSocket
import com.brandonswright.things.infrastructure.websocket.SessionStore
import mu.KotlinLogging
import spark.Spark.staticFiles

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

    GameWebSocket()
    ReadingController()
    WritingController()
}
