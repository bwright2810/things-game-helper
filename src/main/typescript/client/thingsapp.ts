import * as $ from 'jquery'
import * as izitoast from 'izitoast'
import * as Cookies from 'js-cookie'
import { Cookie } from './infrastructure/Cookie'
import { Game } from './domain/Game'
import { Player } from './domain/Player'
import { WebSocketHandler } from './infrastructure/WebSocketHandler'
import { SessionManager } from './infrastructure/SessionManager'
import { GameStateMachine } from './pages/GameStateMachine'
import { WebPageFactory } from './pages/WebPageFactory'
import { StartPage } from './pages/StartPage'

export class ThingsApp {

    private sessionManager: SessionManager
    private stateMachine: GameStateMachine

    constructor() {
        this.sessionManager = new SessionManager()
        this.stateMachine = new GameStateMachine()
    }

    public init() {
        if (this.sessionManager.isLoggedIn()) {
            let gameId = this.sessionManager.getGameId()
            console.log(`Resuming session with game: ${gameId}`)
            $.get(`/game/${gameId}`)
            .done((gameResponse) => {
                if (gameResponse == "NOT FOUND") {
                    console.log(`Game no longer exists. Going to Start page`)
                    this.sessionManager.clearSession()
                    new StartPage().init()
                } else {
                    let game = new Game(JSON.parse(gameResponse))
                    let nextPageName = this.stateMachine.determinePage(game)
                    WebPageFactory.getPage(nextPageName).load(game)
                }
            })
            .fail(err => this.errorMsg(err.responseText))
        } else {
            new StartPage().init()
        }
    }

    private errorMsg = (msg: string) => {
        izitoast.error({ title: "Hey friend!", message: msg, position: 'topLeft', timeout: 10000 })
    }
}