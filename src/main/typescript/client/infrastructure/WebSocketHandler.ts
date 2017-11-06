import { WebPage } from '../pages/Webpage'
import { Game } from '../domain/Game'
import { Message } from '../domain/Message'
import { GameStateMachine } from '../pages/GameStateMachine'
import { WebPageFactory } from '../pages/WebPageFactory'
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
        $.get("/webSocketAddress")
        .done((address: string) => {
            this.socket = new WebSocket(address)

            this.socket.addEventListener('open', (event) => {
                console.log("WebSocket opened")
            });

            this.socket.addEventListener('close', (event) => {
                console.log("WebSocket closed. Re-opening.")
                this.openWs()
            });

            this.socket.addEventListener('message', this.pinged)
        }).fail(err => this.errorMsg(err.responseText))
    }

    private errorMsg = (msg: string) => {
        izitoast.error({ title: "", message: msg, position: 'topLeft', timeout: 10000 })
    }

    public updatePage(webPage: WebPage) {
        this.webPage = webPage
    }

    private pinged = (event: MessageEvent) => {
        const msg = event.data as string

        if (msg.startsWith("JOINED")) {
            const gameJson = JSON.parse(msg.split("|")[1])
            const game = new Game(gameJson)

            if (!this.sessionManager.hasCookie()) {
                const playerId = msg.split("|")[2]
                const name = msg.split("|")[3]

                this.sessionManager.saveCookie(new Cookie(game.id, playerId, name, false))

                izitoast.info({ title: "", message: "Joined Game ${game.id}", 
                    position: 'topLeft', timeout: 4000 })
            }

            this.loadPageForGame(game)
        } else if (msg.startsWith("GAME")) {
            const gameJson = JSON.parse(msg.split("|")[1])
            const game = new Game(gameJson)

            this.loadPageForGame(game)
        } else if (msg.startsWith("TOAST")) {
            const toast = msg.split("|")[1]
            izitoast.info({ title: "", message: toast, 
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
        this.send(command)
    }

    public send = (command: string) => {
        if (this.socket.readyState == this.socket.CONNECTING) {
            setTimeout(this.send, 500, command)
        } else {
            this.socket.send(command)
        }
    }
}