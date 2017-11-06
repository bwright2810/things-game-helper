package com.brandonswright.things.domain.game

import mu.KLogging
import java.util.*

class Game(val id: String, creator: Player) {

    companion object: KLogging()

    val players: MutableList<Player> = mutableListOf()
    val responses: MutableMap<String, Response> = mutableMapOf()
    var state: GameState = GameState.JOINING
        private set

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

    fun canBeBegun(): Boolean {
        return players.size > 1 && state == GameState.JOINING
    }

    fun beginPickingNewReader() {
        this.state = GameState.PICKING
        this.responses.clear()
        this.players.forEach { it.makeWriter() }
        this.shuffledResponses = ArrayList()
    }

    fun pickReader(playerId: String) {
        players.filter { it.id == playerId }.first().makeReader()
        players.filter { it.id != playerId }.forEach { it.makeWriter() }

        this.state = GameState.WRITING_PENDING
    }

    fun canResponseBeWritten(playerId: String): Boolean {
        return state == GameState.WRITING_PENDING && !responses.containsKey(playerId)
    }

    fun addResponse(playerId: String, responseText: String) {
        val responseId = this.generateResponseId()
        val response = Response(responseId, playerId, responseText)
        responses.put(playerId, response)

        if (responses.size == players.size) {
            this.state = GameState.WRITING_SUBMITTED
        }
    }

    private fun generateResponseId(): Int {
        val respList = responses.values.toList()
        return when (respList.isEmpty()) {
            true -> 1
            false -> {
                (respList.maxBy { it.id }?.id ?: 0) + 1
            }
        }
    }

    fun canResponseBeTakenBack(playerId: String): Boolean {
        val isInCorrectState = state == GameState.WRITING_PENDING || state == GameState.WRITING_SUBMITTED
        return isInCorrectState && responses.containsKey(playerId)
    }

    fun takeBackResponse(playerId: String) {
        responses.remove(playerId)

        if (this.state == GameState.WRITING_SUBMITTED) {
            this.state = GameState.WRITING_PENDING
        }
    }

    fun canResponsesBeLocked(): Boolean {
        return state == GameState.WRITING_SUBMITTED
    }

    fun lockResponses() {
        this.state = GameState.READING
    }

    fun startGuessingStage() {
        this.state = GameState.GUESSING
    }

    fun markResponseGuessed(responseId: Int) {
        val response = responses.values.filter { it.id == responseId }.firstOrNull()

        response?.guess()

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

    /**
     * Returns NOT FOUND if a player ID does not exist in this game.
     */
    fun getPlayerNameForId(playerId: String): String {
        val player = players.filter { it.id == playerId }.firstOrNull()
        return player?.name ?: "NOT FOUND"
    }

    fun getPlayerForId(playerId: String): Player {
        val player = players.filter { it.id == playerId }.firstOrNull()
        return player ?: throw IllegalArgumentException("Bad player ID")
    }

    fun getNumberOfPlayers(): Int {
        return players.size
    }

    fun getNumberOfResponses(): Int {
        return responses.size
    }

    private var shuffledResponses: List<Response> = ArrayList()

    fun getResponses(): List<Response> {
        if (shuffledResponses.isEmpty()) {
            val respList = responses.values.toList()
            Collections.shuffle(respList)
            shuffledResponses = respList
        }
        return shuffledResponses
    }
}