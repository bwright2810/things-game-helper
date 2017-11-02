import { WebPage } from './WebPage'
import { Game } from './Game'
import { WebSocketHandler } from './WebSocketHandler'
import { SessionManager } from './SessionManager'
import { Cookie } from './Cookie'
import * as izitoast from 'izitoast'

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
        this.webSocketHandler = new WebSocketHandler(this)
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

    }

    private errorMsg = (msg: string) => {
        izitoast.error({ title: "Hey friend!", message: msg, position: 'topLeft', timeout: 10000 })
    }
}