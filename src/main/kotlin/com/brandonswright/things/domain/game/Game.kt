package com.brandonswright.things.domain.game

import mu.KLogging

class Game(val id: String, creator: Player) {

    companion object: KLogging()

    val players: MutableList<Player> = mutableListOf()
    val responses: MutableMap<String, Response> = mutableMapOf()
    var state: GameState = GameState.JOINING
        private set

    val reader = players.filter { it.isReader }.firstOrNull()

    val writers = players.filter { it.isWriter }

    val creatorName = creator.name

    fun addPlayer(player: Player) {
        if (state == GameState.JOINING) {
            if (!players.contains(player)) {
                logger.info { "Adding player $player" }
                players.add(player)
            }
        } else {
            throw IllegalStateException("Cannot add a player when game is not in joining state")
        }
    }

    fun beginPickingNewReader() {
        this.state = GameState.PICKING
    }

    fun pickReader(playerId: String) {
        players.filter { it.id == playerId }.first().makeReader()
        players.filter { it.id != playerId }.forEach { it.makeWriter() }

        this.state = GameState.WRITING_PENDING
    }

    fun addResponse(response: Response) {
        responses.put(response.playerId, response)

        if (responses.size == players.size) {
            this.state = GameState.WRITING_SUBMITTED
        }
    }

    fun takeBackResponse(playerId: String) {
        responses.remove(playerId)

        if (this.state == GameState.WRITING_SUBMITTED) {
            this.state = GameState.WRITING_PENDING
        }
    }

    fun lockResponses() {
        this.state = GameState.READING
    }

    fun startGuessingStage() {
        this.state = GameState.GUESSING
    }

    fun markPlayersResponseGuessed(playerId: String) {
        responses[playerId]!!.guess()

        if (doesOneResponseRemain()) {
            this.state = GameState.ROUND_OVER
        }
    }

    private fun doesOneResponseRemain(): Boolean {
        val guessed = responses.filter { it.value.isGuessed() }.size
        return responses.size - guessed == 1
    }

    fun isCreator(playerId: String): Boolean {
        val player = players.filter { it.id == playerId }.firstOrNull()
        return player != null && player.name == creatorName
    }
}