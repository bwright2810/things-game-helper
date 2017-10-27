package com.brandonswright.things.application.controller

import com.brandonswright.things.application.config.Injection
import com.brandonswright.things.domain.game.GameRepository
import com.google.gson.Gson
import spark.ModelAndView
import spark.Spark.*
import spark.template.jade.JadeTemplateEngine

class ReadingController {

    val gameRepo: GameRepository = Injection.instance()

    init {
        get("/", { req, res ->
            println(req.cookies())
            return@get ModelAndView(mapOf("message" to "Things App Helper",
                    "msgStyle" to "display:none;"), "index")
        }, JadeTemplateEngine())

        get("/playersList/:gameId", { req, res ->
            val gameId = req.params("gameId")
            val game = gameRepo.findGame(gameId)
            return@get ModelAndView(mapOf("players" to game.players), "playerslist")
        }, JadeTemplateEngine())

        get("/game/:gameId", { req, res ->
            val gameId = req.params("gameId")
            val game = gameRepo.findGame(gameId)
            return@get Gson().toJson(game)
        })
    }
}