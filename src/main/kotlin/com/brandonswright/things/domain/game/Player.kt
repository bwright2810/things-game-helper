package com.brandonswright.things.domain.game

class Player(val name: String, val id: String) {

    private var role = PlayerRole.UNASSIGNED

    val isReader = role == PlayerRole.READER

    val isWriter = role == PlayerRole.WRITER

    fun makeReader() {
        role = PlayerRole.READER
    }

    fun makeWriter() {
        role = PlayerRole.WRITER
    }

    override fun toString(): String {
        return "Player(name='$name', id='$id', role=$role)"
    }
}