//package com.brandonswright
//
//import com.brandonswright.things.domain.game.Game
//import com.brandonswright.things.domain.game.GameState
//import com.brandonswright.things.domain.game.Player
//import com.brandonswright.things.domain.game.Response
//import org.junit.Assert
//import org.junit.Test
//
//class GameTest {
//
//    @Test
//    fun test() {
//        val creator = Player("Brandon", "1")
//        val game = Game("1", creator)
//
//        Assert.assertEquals("Brandon", game.creatorName)
//        Assert.assertTrue(game.state == GameState.JOINING)
//
//        game.addPlayer(Player("Andrew", "2"))
//        game.addPlayer(Player("Brandy", "3"))
//
//        game.beginPickingNewReader()
//        Assert.assertTrue(game.state == GameState.PICKING)
//
//        game.pickReader("1")
//        Assert.assertTrue(game.state == GameState.WRITING_PENDING)
//
//        game.addResponse(Response("2", "Cats"))
//        game.addResponse(Response("1", "Dogs"))
//        Assert.assertTrue(game.state == GameState.WRITING_PENDING)
//        game.addResponse(Response("3", "Birds"))
//        Assert.assertTrue(game.state == GameState.WRITING_SUBMITTED)
//
//        game.lockResponses()
//        Assert.assertTrue(game.state == GameState.READING)
//
//        game.startGuessingStage()
//        Assert.assertTrue(game.state == GameState.GUESSING)
//
//        game.markPlayersResponseGuessed("1")
//        Assert.assertTrue(game.state == GameState.GUESSING)
//
//        game.markPlayersResponseGuessed("2")
//        Assert.assertTrue(game.state == GameState.ROUND_OVER)
//
//        game.beginPickingNewReader()
//        Assert.assertTrue(game.state == GameState.PICKING)
//
//        game.pickReader("2")
//        Assert.assertTrue(game.state == GameState.WRITING_PENDING)
//    }
//}
