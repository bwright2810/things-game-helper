import { WebPage } from './Webpage'
import { Game } from './Game'
import { Message } from './Message'
import { GameStateMachine } from './GameStateMachine'
import { WebPageFactory } from './WebPageFactory'
import { SessionManager } from './SessionManager'
import * as izitoast from 'izitoast'
import { Cookie } from './Cookie'

export class WebSocketHandler {

    private socket: WebSocket
    private webPage: WebPage
    private stateMachine: GameStateMachine
    private sessionManager: SessionManager
    
    constructor(webPage: WebPage) {
        this.webPage = webPage
        this.stateMachine = new GameStateMachine()
        this.sessionManager = new SessionManager()
        this.openWs()
    }

    private openWs = () => {
        this.socket = new WebSocket('ws://localhost:4567/echo')

        this.socket.addEventListener('open', (event) => {
            console.log("Echo WS opened")
        });

        this.socket.addEventListener('close', (event) => {
            console.log("Echo WS closed. Re-opening.")
            this.openWs()
        });

        this.socket.addEventListener('message', this.pinged)
    }

    private pinged = (event: MessageEvent) => {
        const msg = event.data as string
        console.log(`Message from server: ${msg}`)

        if (msg.startsWith("JOINED")) {
            const gameJson = JSON.parse(msg.split("|")[1])
            const game = new Game(gameJson)

            if (!this.sessionManager.hasCookie()) {
                const playerId = msg.split("|")[2]
                const name = msg.split("|")[3]

                this.sessionManager.saveCookie(new Cookie(game.id, playerId, name, false))
            }

            this.loadPageForGame(game)
        } else if (msg.startsWith("GAME")) {
            const gameJson = JSON.parse(msg.split("|")[1])
            const game = new Game(gameJson)

            this.loadPageForGame(game)
            //const joinedPlayerId = msg.split("|")[2]
            /**this.displayJoinedGame(joinedPlayerId, game.creatorName, game.players)

            if (this.cookie().isCreator) {
                if (game.players.length > 1) {
                    $("#gameButtons").append("<br>")
                    $("#gameButtons").append("<button type='button' id='begin-btn' onclick='things.beginGame();'>Begin</button>")
                    $("#gameButtons").css("display", "block")
                }
            }**/
        } else if (msg.startsWith("TOAST")) {
            const toast = msg.split("|")[1]
            izitoast.info({ title: "Hey friend!", message: toast, 
                position: 'topLeft', timeout: 4000 })
        }
    }

    private loadPageForGame = (game: Game) => {
        let pageName = this.stateMachine.determinePage(game)
        
        if (this.webPage.getName() == pageName) {
            this.webPage.update(game)
        } else {
            WebPageFactory.getPage(pageName).load(game)
        }
    }
    
    public sendJoinCommand = (gameId: string, playerId: string, name: string) => {
        const command = `JOIN|${gameId}|${playerId}|${name}`
        console.log(`Sending: ${command}`)
        this.send(command)
    }

    public send = (command: string) => {
        if (this.socket.readyState == this.socket.CONNECTING) {
            setTimeout(this.send, 500)
        } else {
            this.socket.send(command)
        }
    }
}