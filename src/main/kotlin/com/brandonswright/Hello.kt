package com.brandonswright

import spark.ModelAndView
import spark.Spark.*
import spark.template.jade.JadeTemplateEngine
import spark.Spark.staticFiles

fun main(args: Array<String>) {

    val isProd = args[0].toBoolean()

    if (!isProd) {
        val projectDir = System.getProperty("user.dir")
        val staticDir = "/public"
        staticFiles.externalLocation(projectDir + staticDir)
    } else {
        staticFiles.location("/public")
    }

    webSocket("/echo", EchoWebSocket::class.java)

    get("/", { req, res ->
        ModelAndView(mapOf("message" to "Hello dude", "msgStyle" to "display:none;"), "index")
    },
            JadeTemplateEngine())
}
