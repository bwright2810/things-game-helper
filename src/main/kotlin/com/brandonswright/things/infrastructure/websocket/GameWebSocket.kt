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

@WebSocket
class GameWebSocket {

    val sessionStore: SessionStore = Injection.instance()
    val requestHandlingService: RequestHandlingService = Injection.instance()

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

            val broadcast = "JOINED|${Gson().toJson(game)}|$playerId"

            broadcastToAllPlayers(broadcast, gameId)
            return
        }
        session.remote.sendString(message) // and send it back
    }

    private fun broadcastToAllPlayers(broadcast: String, gameId: String) {
        sessionStore.getAllSessionsForGame(gameId).forEach { it.remote.sendString(broadcast) }
    }
}