import { WebPage } from './WebPage'
import { Game } from '../domain/Game'
import { WebSocketHandler } from '../infrastructure/WebSocketHandler'
import { SessionManager } from '../infrastructure/SessionManager'
import * as izitoast from 'izitoast'
import { WebSocketHandlerFactory } from '../infrastructure/WebSocketHandlerFactory'
import * as $ from 'jquery'

export class GuessingPage extends WebPage {

    public static TITLE = "GUESSING"

    private webSocketHandler: WebSocketHandler
    private sessionManager: SessionManager

    public constructor() {
        super()
        this.sessionManager = new SessionManager()
    }

    public getName(): string {
        return GuessingPage.TITLE
    }

    public load(game: Game) {
        this.webSocketHandler = WebSocketHandlerFactory.buildWebSocketHandler(this)
        this.enableClientAccess()
            
        $.get(`/guessingPage/${game.id}/${this.sessionManager.getPlayerId()}`)
        .done((html: string) => {
            $('#main-msg').text(`In ${game.creatorName}'s Game (${game.id})`)
            $('#main-content').html(html)
        })
        .fail(err =>  {
            console.log(err)
            this.errorMsg(err.responseText)
        })
    }

    private enableClientAccess = () => {
        (<any> window).things = this
    }

    public update(game: Game) {
        $.get(`/guessingPage/${game.id}/${this.sessionManager.getPlayerId()}`)
        .done((html: string) => {
            $('#main-content').html(html)
        })
        .fail(err => this.errorMsg(err.responseText))
    }

    private errorMsg = (msg: string) => {
        izitoast.error({ title: "", message: msg, position: 'topLeft', timeout: 10000 })
    }

    public startGuessing = () => {
        $.post("/startGuessing", { gameId: this.sessionManager.getGameId() })
        .fail(err => this.errorMsg(err.responseText))
    }

    public markGuessed = (responseId: string) => {
        $.post("/guess", { gameId: this.sessionManager.getGameId(), responseId: responseId })
        .fail(err => this.errorMsg(err.responseText))
    }

    public pickNewReader = () => {
        $.post("/begin", { gameId: this.sessionManager.getGameId() })
        .fail(err => this.errorMsg(err.responseText))
    }
}