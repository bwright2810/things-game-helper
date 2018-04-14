package com.brandonswright.things.infrastructure.websocket

import com.brandonswright.things.application.config.Injection
import com.brandonswright.things.application.request.RequestHandlingService
import com.brandonswright.things.domain.game.GameRepository
import com.brandonswright.things.domain.game.Player
import com.google.gson.Gson
import org.eclipse.jetty.websocket.api.Session
import org.eclipse.jetty.websocket.api.annotations.WebSocket
import java.io.IOException
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect
import spark.Spark

@WebSocket
class GameWebSocket {

    companion object {
        fun init() {
            Spark.webSocket("/things", GameWebSocket::class.java)
        }

        val WEB_SOCKET_ADDRESS = "ws://192.168.1.68:4567/things"
    }

    private val sessionStore: SessionStore = Injection.instance()
    private val requestHandlingService: RequestHandlingService = Injection.instance()

    @OnWebSocketConnect
    fun connected(session: Session) {
        println("Connected session with address: ${session.remoteAddress.address}")
    }

    @OnWebSocketClose
    fun closed(session: Session, statusCode: Int, reason: String) {
    }

    @OnWebSocketMessage
    @Throws(IOException::class)
    fun message(session: Session, message: String) {
        if (message.startsWith("JOIN")) {
            val (_, gameId, playerId, playerName) = message.split("|")
            sessionStore.saveSession(gameId, playerId, session)

            val game = requestHandlingService.handleJoinRequest(gameId, Player(playerName, playerId))
            val isCreator = "false"

            val broadcast = "JOINED|${Gson().toJson(game)}|$playerId|$isCreator"

            sessionStore.broadcastToGamePlayers(gameId, broadcast)
            return
        }
    }
}