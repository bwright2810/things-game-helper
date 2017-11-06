import { WebPage } from './WebPage'
import { Game } from './Game'
import { WebSocketHandler } from './WebSocketHandler'
import { SessionManager } from './SessionManager'
import * as izitoast from 'izitoast'
import { WebSocketHandlerFactory } from './WebSocketHandlerFactory'
import * as $ from 'jquery'

export class ResponsePage extends WebPage {

    public static TITLE = "RESPONSE"

    private webSocketHandler: WebSocketHandler
    private sessionManager: SessionManager

    public constructor() {
        super()
        this.sessionManager = new SessionManager()
    }

    public getName(): string {
        return ResponsePage.TITLE
    }

    public load(game: Game) {
        this.webSocketHandler = WebSocketHandlerFactory.buildWebSocketHandler(this)
        this.enableClientAccess()
            
        $.get(`/responsePage/${game.id}/${this.sessionManager.getPlayerId()}`)
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
        $.get(`/responsePage/${game.id}/${this.sessionManager.getPlayerId()}`)
        .done((html: string) => {
            $('#main-content').html(html)

            if (game.state == "WRITING_SUBMITTED" && game.isPlayerReader(this.sessionManager.getPlayerId())) {
                izitoast.info({ title: "Hey friend!", message: "All responses submitted!", 
                    position: 'topLeft', timeout: 3000 })
            }
        })
        .fail(err => this.errorMsg(err.responseText))
    }

    private errorMsg = (msg: string) => {
        izitoast.error({ title: "Hey friend!", message: msg, position: 'topLeft', timeout: 10000 })
    }

    public addResponse = () => {
        const response = this.inputValue($('#responseInput').get(0))
        $.post("/addResponse", { gameId: this.sessionManager.getGameId(), playerId: this.sessionManager.getPlayerId(),
            responseText: response })
        .fail(err => this.errorMsg(err.responseText))

        izitoast.info({ title: "Hey friend!", message: "Response Added!", 
            position: 'topLeft', timeout: 2000 })
    }

    private inputValue = (element: HTMLElement): string => {
        return (<HTMLInputElement> element).value
    }

    public rewriteResponse = () => {
        $.post("/removeResponse", { gameId: this.sessionManager.getGameId(), playerId: this.sessionManager.getPlayerId() })
        .fail(err => this.errorMsg(err.responseText))

        izitoast.info({ title: "Hey friend!", message: "You can now re-write your response", 
            position: 'topLeft', timeout: 3000 })
    }

    public lockResponses = () => {
        $.post("/lockResponses", { gameId: this.sessionManager.getGameId() })
        .fail(err => this.errorMsg(err.responseText))
    }
}