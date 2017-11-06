package com.brandonswright.things.domain.game

class Player(val name: String, val id: String) {

    var role = PlayerRole.UNASSIGNED
        private set

    fun isReader() = role == PlayerRole.READER

    fun isWriter() = role == PlayerRole.WRITER

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