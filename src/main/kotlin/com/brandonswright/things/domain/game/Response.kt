package com.brandonswright.things.domain.game

class Response(val id: Int, val playerId: String, val text: String) {

    var state: ResponseState = ResponseState.SUBMITTED
        private set

    fun guess() {
        this.state = ResponseState.GUESSED
    }

    fun isGuessed() = state == ResponseState.GUESSED
}