package com.brandonswright.things.application.request

import com.brandonswright.things.application.config.Injection
import com.brandonswright.things.domain.game.Game
import com.brandonswright.things.domain.game.GameRepository
import com.brandonswright.things.domain.game.Player
import java.util.*

class RequestHandlingServiceImpl : RequestHandlingService {

    val gameRepo: GameRepository = Injection.instance()

    override fun handleNewGameRequest(playerName: String, playerId: String): Game {
        val creator = Player(playerName, playerId)
        val gameId = generateNewGameId(playerName)

        val newGame = Game(gameId, creator)
        gameRepo.saveOrUpdateGame(newGame)
        return newGame
    }

    private fun generateNewGameId(playerName: String): String {
        return "G" + playerName.toUpperCase() + Date().time.toString().substring(9)
    }

    override fun handleJoinRequest(gameId: String, player: Player): Game {
        val game = gameRepo.findGame(gameId)
        game.addPlayer(player)
        gameRepo.saveOrUpdateGame(game)

        return game
    }
}