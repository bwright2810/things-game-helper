import { WebPage } from './WebPage'
import { Game } from './Game'
import { WebSocketHandler } from './WebSocketHandler'
import { SessionManager } from './SessionManager'
import { Cookie } from './Cookie'
import * as izitoast from 'izitoast'
import { WebSocketHandlerFactory } from './WebSocketHandlerFactory'
import * as $ from 'jquery'

export class LobbyPage extends WebPage {

    public static TITLE = "LOBBY"
    private webSocketHandler: WebSocketHandler
    private sessionManager: SessionManager

    public constructor() {
        super()
        this.sessionManager = new SessionManager()
    }

    public getName(): string {
        return LobbyPage.TITLE
    }

    public load(game: Game) {
        console.log(`In LobbyPage load`)

        this.webSocketHandler = WebSocketHandlerFactory.buildWebSocketHandler(this)
        this.enableClientAccess()
            
        $.get(`/lobbyPage/${game.id}/${this.sessionManager.getPlayerId()}`)
        .done((html: string) => {
            izitoast.info({ title: "Hey friend!", message: `Joined Game ${game.id}`, 
            position: 'topLeft', timeout: 4000 })
            $('#main-msg').text(`In ${game.creatorName}'s Game (${game.id})`)
            $('#main-content').html(html)
        })
        .fail(err => this.errorMsg(err.responseText))
    }

    private enableClientAccess = () => {
        (<any> window).things = this
    }

    public update(game: Game) {
        console.log(`In LobbyPage update`)

        $.get(`/lobbyPage/${game.id}/${this.sessionManager.getPlayerId()}`)
        .done((html: string) => {
            $('#main-content').html(html)
        })
        .fail(err => this.errorMsg(err.responseText))
    }

    private errorMsg = (msg: string) => {
        izitoast.error({ title: "Hey friend!", message: msg, position: 'topLeft', timeout: 10000 })
    }

    public beginGame = () => {
        $.post("/begin", { gameId: this.sessionManager.getGameId() })
        .fail(err => this.errorMsg(err.responseText))
    }

    public makeReader = (selectedPlayerId: string) => {
        $.post("/pickReader", { gameId: this.sessionManager.getGameId(), readerId: selectedPlayerId })
        .fail(err => this.errorMsg(err.responseText))
    }
}