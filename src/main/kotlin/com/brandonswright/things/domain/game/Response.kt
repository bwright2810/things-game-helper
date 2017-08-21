package com.brandonswright.things.domain.game

class Response(val responseText: String) {

    var state: ResponseState = ResponseState.SUBMITTED

    fun guessed() {
        this.state = ResponseState.GUESSED
    }
}