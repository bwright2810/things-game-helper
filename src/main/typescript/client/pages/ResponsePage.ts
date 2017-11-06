import { WebPage } from './WebPage'
import { Game } from '../domain/Game'
import { WebSocketHandler } from '../infrastructure/WebSocketHandler'
import { SessionManager } from '../infrastructure/SessionManager'
import * as izitoast from 'izitoast'
import { WebSocketHandlerFactory } from '../infrastructure/WebSocketHandlerFactory'
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
            this.addEventHooks()
        })
        .fail(err =>  {
            console.log(err)
            this.errorMsg(err.responseText)
        })
    }

    private enableClientAccess = () => {
        (<any> window).things = this
    }

    private addEventHooks = () => {
        $("#responseInput").keyup((event) => {
            if (event.keyCode == 13) {
                $("#send-btn").click();
            }
        });
    }

    public update(game: Game) {
        $.get(`/responsePage/${game.id}/${this.sessionManager.getPlayerId()}`)
        .done((html: string) => {
            $('#main-content').html(html)
            this.addEventHooks()

            if (game.state == "WRITING_SUBMITTED" && game.isPlayerReader(this.sessionManager.getPlayerId())) {
                izitoast.info({ title: "", message: "All responses submitted!", 
                    position: 'topLeft', timeout: 3000 })
            }
        })
        .fail(err => this.errorMsg(err.responseText))
    }

    private errorMsg = (msg: string) => {
        izitoast.error({ title: "", message: msg, position: 'topLeft', timeout: 5000 })
    }

    public addResponse = () => {
        const response = this.inputValue($('#responseInput').get(0))

        const error = this.validate(response)
        if (error != null) {
            this.errorMsg(error)
            return
        }

        $.post("/addResponse", { gameId: this.sessionManager.getGameId(), playerId: this.sessionManager.getPlayerId(),
            responseText: response })
        .fail(err => this.errorMsg(err.responseText))

        izitoast.info({ title: "", message: "Response Added!", 
            position: 'topLeft', timeout: 2000 })
    }

    private inputValue = (element: HTMLElement): string => {
        return (<HTMLInputElement> element).value
    }

    private validate = (response: string): string => {
        if (response.trim().length == 0) {
            return "Response cannot be empty"
        }

        if (response.trim().length > 200) {
            return "Response too long"
        }

        return null
    }

    public rewriteResponse = () => {
        $.post("/removeResponse", { gameId: this.sessionManager.getGameId(), playerId: this.sessionManager.getPlayerId() })
        .fail(err => this.errorMsg(err.responseText))

        izitoast.info({ title: "", message: "You can now re-write your response", 
            position: 'topLeft', timeout: 3000 })
    }

    public lockResponses = () => {
        $.post("/lockResponses", { gameId: this.sessionManager.getGameId() })
        .fail(err => this.errorMsg(err.responseText))
    }
}