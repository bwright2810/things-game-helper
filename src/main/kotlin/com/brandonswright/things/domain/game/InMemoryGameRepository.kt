package com.brandonswright.things.domain.game

import java.util.concurrent.ConcurrentHashMap

class InMemoryGameRepository : GameRepository {

    private val gamesMap: MutableMap<String, Game> = ConcurrentHashMap()

    override fun findGame(gameId: String): Game {
        return gamesMap[gameId] ?: throw IllegalArgumentException("Game with ID $gameId does not exist")
    }

    override fun saveOrUpdateGame(game: Game) {
        gamesMap.put(game.id, game)
    }

    override fun deleteGame(gameId: String) {
        gamesMap.remove(gameId)
    }
}