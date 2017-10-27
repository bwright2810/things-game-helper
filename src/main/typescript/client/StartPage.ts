import { WebPage } from './WebPage'
import { Game } from './Game'
import { WebSocketHandler } from './WebSocketHandler'
import { SessionManager } from './SessionManager'
import { Cookie } from './Cookie'
import * as izitoast from 'izitoast'

export class StartPage extends WebPage {

    public static TITLE = "START"
    private webSocketHandler: WebSocketHandler
    private sessionManager: SessionManager

    public constructor() {
        super()
        this.sessionManager = new SessionManager()
    }

    public getName(): string {
        return StartPage.TITLE
    }

    public init() {
        this.load(null)
    }

    public load(game: Game) {
        this.webSocketHandler = new WebSocketHandler(this)
    }

    public update(game: Game) {

    }

    public newGame = () => {
        const error = this.validate(false)

        if (error != null) {
            this.errorMsg(error)
            return;
        }

        const nick = this.inputValue($('#name').get(0))
        const newPlayerId = this.generateNewPlayerId(nick)

        $.post('/create', { playerName: nick, playerId: newPlayerId })
            .done(data =>  {
                const gameJson = JSON.parse(data)
                console.log(gameJson)
                const game = new Game(gameJson)

                this.sessionManager.saveCookie(new Cookie(game.id, newPlayerId, nick, true))
                this.sendJoinCommand(game.id, newPlayerId, nick)
            })
            .fail(err => this.errorMsg(err.responseText))
    }

    private errorMsg = (msg: string) => {
        izitoast.error({ title: "Hey friend!", message: msg, position: 'topLeft', timeout: 10000 })
    }

    private validate = (joining: boolean): string => {
        const nick = this.inputValue($('#name').get(0))

        if (nick == "") {
            return "Please enter a nickname";
        }

        if (joining) {
            const gameId = this.inputValue($('#game-id').get(0))

            if (gameId == "") {
                return "Please enter ID of game to join";
            }
        }

        return null;
    }

    private inputValue = (element: HTMLElement): string => {
        return (<HTMLInputElement> element).value
    }

    private generateNewPlayerId = (playerName: string): string => {
        return `P${playerName.toUpperCase()}${new Date().getTime().toString().substring(9)}`
    }
}