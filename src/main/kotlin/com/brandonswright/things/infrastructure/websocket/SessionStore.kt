package com.brandonswright.things.infrastructure.websocket

import org.eclipse.jetty.websocket.api.Session

interface SessionStore {

    fun saveSession(gameId: String, playerId: String, session: Session)

    fun getSession(gameId: String, playerId: String): Session?

    fun getAllSessionsForGame(gameId: String): List<Session>

    fun deleteSession(gameId: String, playerId: String)

    fun exists(gameId: String, playerId: String): Boolean
}