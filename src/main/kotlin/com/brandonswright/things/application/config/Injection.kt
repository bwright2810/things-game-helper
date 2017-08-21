package com.brandonswright.things.application.config

import com.brandonswright.things.application.request.RequestHandlingService
import com.brandonswright.things.application.request.RequestHandlingServiceImpl
import com.brandonswright.things.domain.game.GameRepository
import com.brandonswright.things.domain.game.InMemoryGameRepository
import com.brandonswright.things.infrastructure.websocket.InMemorySessionStore
import com.brandonswright.things.infrastructure.websocket.SessionStore
import com.github.salomonbrys.kodein.Kodein
import com.github.salomonbrys.kodein.bind
import com.github.salomonbrys.kodein.instance
import com.github.salomonbrys.kodein.singleton

class Injection {
    companion object {
        val kodein = Kodein {
            bind<SessionStore>() with singleton { InMemorySessionStore() }
            bind<GameRepository>() with singleton { InMemoryGameRepository() }
            bind<RequestHandlingService>() with singleton { RequestHandlingServiceImpl() }
        }

        inline fun <reified T: Any> instance(): T = kodein.instance()
    }
}