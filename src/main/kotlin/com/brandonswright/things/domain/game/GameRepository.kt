package com.brandonswright.things.domain.game

interface GameRepository {

    fun findGame(gameId: String): Game

    fun saveOrUpdateGame(game: Game)

    fun deleteGame(gameId: String)

    fun doAndSave(gameId: String, apply: (Game) -> Unit): Game
}