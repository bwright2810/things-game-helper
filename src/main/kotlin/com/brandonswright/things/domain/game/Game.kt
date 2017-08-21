package com.brandonswright.things.domain.game

class Game(val id: String, private val creator: Player) {

    var state: GameState = GameState.JOINING
        private set
    val players: MutableList<Player> = mutableListOf()

    init {
        players.add(creator)
    }

    val reader = players.filter { it.isReader }.firstOrNull()

    val writers = players.filter { it.isWriter }

    val creatorName = creator.name

    fun addPlayer(player: Player) {
        if (state == GameState.JOINING) {
            players.add(player)
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

    fun addResponse(playerId: String, response: Response) {
        players.filter{ it.id == playerId }.first().response = response

        if (players.all { it.hasResponded() }) {
            this.state = GameState.WRITING_SUBMITTED
        }
    }

    fun lockResponses() {
        this.state = GameState.READING
    }

    fun startGuessingStage() {
        this.state = GameState.GUESSING
    }

    fun markPlayersResponseGuessed(playerId: String) {
        players.filter{ it.id == playerId }.first().markResponseGuessed()

        if (doesOneResponseRemain()) {
            this.state = GameState.ROUND_OVER
        }
    }

    private fun doesOneResponseRemain(): Boolean {
        val guessed = players.filter { it.isResponseGuessed() }.size
        return players.size - guessed == 1
    }
}