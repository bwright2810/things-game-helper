package com.brandonswright.things.domain.game

class Player(val name: String, val id: String) {

    var response: Response? = null
    private var role = PlayerRole.UNASSIGNED

    val isReader = role == PlayerRole.READER

    val isWriter = role == PlayerRole.WRITER

    fun makeReader() {
        role = PlayerRole.READER
    }

    fun makeWriter() {
        role = PlayerRole.WRITER
    }

    fun hasResponded() = response != null

    fun markResponseGuessed() {
        response?.guessed()
    }

    fun isResponseGuessed() = response!!.state == ResponseState.GUESSED
}