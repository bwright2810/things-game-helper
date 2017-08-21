package com.brandonswright.things.domain.game

class Response(val playerId: String, val responseText: String) {

    var state: ResponseState = ResponseState.SUBMITTED
        private set

    fun guess() {
        this.state = ResponseState.GUESSED
    }

    fun isGuessed() = state == ResponseState.GUESSED
}