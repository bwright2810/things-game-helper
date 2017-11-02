import * as $ from 'jquery'
import * as izitoast from 'izitoast'
import * as Cookies from 'js-cookie'
import { Cookie } from './Cookie'
import { Game } from './Game'
import { Player } from './Player'
import { WebSocketHandler } from './WebSocketHandler'
import { SessionManager } from './SessionManager'
import { GameStateMachine } from './GameStateMachine'
import { WebPageFactory } from './WebPageFactory'
import { StartPage } from './StartPage'

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
        
        // this.hide("name")
        // this.hide("game-id")
        // this.hide("join-btn")
        // this.hide("or")
        // this.hide("new-btn")
        
        $("#main-msg").text(`In ${creatorName}'s Game (${gameId})`)
        $("#main-content").empty()
        $.get(`/playersList/${gameId}`)
        .done((html) => {
            $("#main-content").html(html)
        })
        .fail(err => this.errorMsg(err.responseText))
        
        // let playersDiv = $("#players")
        // playersDiv.css("display", "none")
        // playersDiv.empty()

        // playersDiv.append("<h3>Players Joined:</h3>")
        // playersDiv.append("<ul>")
        // for (let player of players) {
        //     playersDiv.append(`<li>${player.name}</li>`)
        // }
        // playersDiv.append("</ul>")
        // playersDiv.css("display", "block")
    }

    private hide = (elementId: string) => {
        $(`#${elementId}`).get()[0].style.display = "none"
    }

    private errorMsg = (msg: string) => {
        izitoast.error({ title: "Hey friend!", message: msg, position: 'topLeft', timeout: 10000 })
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