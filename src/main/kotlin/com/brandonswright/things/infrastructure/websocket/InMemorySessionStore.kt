package com.brandonswright.things.infrastructure.websocket

import mu.KLogging
import org.eclipse.jetty.websocket.api.Session
import org.eclipse.jetty.websocket.api.WebSocketException
import java.util.concurrent.ConcurrentHashMap

data class PlayerSessionKey(val gameId: String, val playerId: String)

class InMemorySessionStore : SessionStore {

    companion object: KLogging()

    val sessionMap: MutableMap<PlayerSessionKey, Session> = ConcurrentHashMap()

    override fun saveSession(gameId: String, playerId: String, session: Session) {
        logger.info { "Saving web socket session for player $playerId in game $gameId" }
        sessionMap.put(PlayerSessionKey(gameId, playerId), session)
    }

    override fun getSession(gameId: String, playerId: String): Session? {
        return sessionMap[PlayerSessionKey(gameId, playerId)]
    }

    override fun getAllSessionsForGame(gameId: String): List<Session> {
        return sessionMap.filter { it.key.gameId == gameId }.values.toList()
    }

    override fun deleteSession(gameId: String, playerId: String) {
        sessionMap.remove(PlayerSessionKey(gameId, playerId))
    }

    override fun exists(gameId: String, playerId: String): Boolean {
        return sessionMap.containsKey(PlayerSessionKey(gameId, playerId))
    }

    override fun broadcastToGamePlayers(gameId: String, msg: String) {
        sessionMap.filter { it.key.gameId == gameId }.keys.forEach {
            val session = sessionMap[it] ?: throw IllegalStateException("Shouldn't happen")
            try {
                session.remote.sendString(msg)
            } catch (e: WebSocketException) {
                println("Session for $it is no longer connected. Removing from store")
                deleteSession(it.gameId, it.playerId)
            }
        }
    }
}