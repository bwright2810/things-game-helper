package com.brandonswright.things.application.request

import com.brandonswright.things.domain.game.Game
import com.brandonswright.things.domain.game.Player

interface RequestHandlingService {

    fun handleNewGameRequest(playerName: String, playerId: String): Game

    fun handleJoinRequest(gameId: String, player: Player): Game

}