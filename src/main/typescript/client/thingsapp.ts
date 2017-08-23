import * as $ from 'jquery'
import * as izitoast from 'izitoast'
import * as Cookies from 'js-cookie'
import { Cookie } from './Cookie'
import { Game } from './Game'
import { Player } from './Player'

export class ThingsApp {

    private socket: WebSocket

    constructor() {
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
            const joinedPlayerId = msg.split("|")[2]
            this.displayJoinedGame(joinedPlayerId, game.creatorName, game.players)

            if (this.cookie().isCreator) {
                if (game.players.length > 1) {
                    $("#gameButtons").append("<br>")
                    $("#gameButtons").append("<button type='button' id='begin-btn' onclick='things.beginGame();'>Begin</button>")
                    $("#gameButtons").css("display", "block")
                }
            }
        } else if (msg.startsWith("TOAST")) {
            const toast = msg.split("|")[1]
            izitoast.info({ title: "Hey friend!", message: toast, 
                position: 'topLeft', timeout: 4000 })
        }
    }

    private cookie() {
        return Cookie.fromValue(Cookies.get("things"))
    }

    private displayJoinedGame = (joinedPlayerId: string, creatorName: string, players: Player[]) => {
        const gameId = this.cookie().gameId
        const storedPlayerId = this.cookie().playerId
        if (storedPlayerId == joinedPlayerId) {
            izitoast.info({ title: "Hey friend!", message: `Joined Game ${gameId}`, 
                position: 'topLeft', timeout: 4000 })
        }
        
        this.hide("name")
        this.hide("game-id")
        this.hide("join-btn")
        this.hide("or")
        this.hide("new-btn")
        
        $("#main-content").get()[0].textContent = `In ${creatorName}'s Game (${gameId})`
        
        let playersDiv = $("#players")
        playersDiv.css("display", "none")
        playersDiv.empty()

        playersDiv.append("<h3>Players Joined:</h3>")
        playersDiv.append("<ul>")
        for (let player of players) {
            playersDiv.append(`<li>${player.name}</li>`)
        }
        playersDiv.append("</ul>")
        playersDiv.css("display", "block")
    }

    private hide = (elementId: string) => {
        $(`#${elementId}`).get()[0].style.display = "none"
    }

    private reopenWsIfNeeded = () => {
        if (this.socket.readyState != 1) {
            this.openWs();
        }
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

                this.setCookie(new Cookie(game.id, newPlayerId, nick, true))
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

    private setCookie = (cookie: Cookie) => {
        Cookies.set("things", cookie.toValue())
    }

    public joinGame = () => {
        const error = this.validate(true)
        if (error != null) {
            this.errorMsg(error)
            return;
        }

        const textField = document.getElementById("game-id");
        const gameId = ((<any> textField).value as string).toUpperCase()

        const nick = this.inputValue($('#name').get(0))
        const newPlayerId = this.generateNewPlayerId(nick)

        this.setCookie(new Cookie(gameId, newPlayerId, nick, false))
        
        this.sendJoinCommand(gameId, newPlayerId, nick)
    }

    private sendJoinCommand(gameId: string, playerId: string, playerName: string) {
        const command = `JOIN|${gameId}|${playerId}|${playerName}`

        console.log(`Sending: ${command}`)
        this.socket.send(command)
    }

    private beginGame = () => {
        $.post("/begin", this.cookie()).done(data => {
            console.log(data)
            let gameJson = JSON.parse(data)
            const game = new Game(gameJson)

            this.hide("begin-btn")
            let playersDiv = $("#players")
            playersDiv.css("display", "none")
            playersDiv.empty()
    
            playersDiv.append("<h3>Players Joined:</h3>")
            playersDiv.append("<ul>")
            for (let player of game.players) {
                playersDiv.append(`<li>${player.name} <button onclick='things.makeReader(${player.id});'>Make Reader</button></li>`)
            }
            playersDiv.append("</ul>")
            playersDiv.css("display", "block")
        }).fail(err => this.errorMsg(err.responseText))
    }
}