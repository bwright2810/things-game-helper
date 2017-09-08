package com.brandonswright.things.infrastructure.websocket

import com.brandonswright.things.domain.game.Game
import com.google.gson.Gson

class WebSocketMessageFactory {

    companion object {

        fun buildMessageForGame(game: Game): String {
            return "GAME|${Gson().toJson(game)}"
        }
    }
}