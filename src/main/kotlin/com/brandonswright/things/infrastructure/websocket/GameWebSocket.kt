package com.brandonswright.things.infrastructure.websocket

import org.eclipse.jetty.websocket.api.Session
import org.eclipse.jetty.websocket.api.annotations.WebSocket
import java.io.IOException
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect
import java.util.concurrent.ConcurrentLinkedQueue

@WebSocket
class GameWebSocket {
    // Store sessions if you want to, for example, broadcast a message to all users
    private val sessions = ConcurrentLinkedQueue<Session>()

    @OnWebSocketConnect
    fun connected(session: Session) {
        println("Connected session with address: ${session.remoteAddress.address}")
        sessions.add(session)
    }

    @OnWebSocketClose
    fun closed(session: Session, statusCode: Int, reason: String) {
        sessions.remove(session)
    }

    @OnWebSocketMessage
    @Throws(IOException::class)
    fun message(session: Session, message: String) {
        println("Got: " + message)   // Print message
        session.remote.sendString(message) // and send it back
    }
}