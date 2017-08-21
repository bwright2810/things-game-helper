import * as $ from 'jquery'
import * as izitoast from 'izitoast'
import * as Cookies from 'js-cookie'

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
            const [_, gameId, playerId, creatorName, playersString] = msg.split("|")
            this.displayJoinedGame(playerId, creatorName, playersString)
        }
    }

    private displayJoinedGame = (playerId: string, creatorName: string, playersString: string) => {
        const gameId = Cookies.get("things").split("|")[0]
        const storedPlayerId = Cookies.get("things").split("|")[1]
        if (storedPlayerId == playerId) {
            izitoast.info({ title: "Hey friend!", message: `Joined Game ${gameId}`, 
                position: 'topLeft', timeout: 4000 })
        }
        
        this.hide("name")
        this.hide("game-id")
        this.hide("join-btn")
        this.hide("or")
        this.hide("new-btn")
        
        $("#main-content").get()[0].textContent = `In ${creatorName}'s Game (${gameId})`
        
        let players = playersString.split(",")
        let playersDiv = $("#players")
        playersDiv.css("display", "none")
        playersDiv.empty()

        playersDiv.append("<h3>Players Joined:</h3>")
        playersDiv.append("<ul>")
        for (let player of players) {
            playersDiv.append(`<li>${player}</li>`)
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
                const json = JSON.parse(data)
                console.log(json)

                this.setCookie(json.gameId, newPlayerId, nick)
                this.sendJoinCommand(json.gameId, newPlayerId, nick)
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

    private setCookie = (gameId: string, playerId: string, name: string) => {
        Cookies.set("things", `${gameId}|${playerId}|${name}`)
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

        this.setCookie(gameId, newPlayerId, nick)
        
        this.sendJoinCommand(gameId, newPlayerId, nick)
    }

    private sendJoinCommand(gameId: string, playerId: string, playerName: string) {
        const command = `JOIN|${gameId}|${playerId}|${playerName}`

        console.log(`Sending: ${command}`)
        this.socket.send(command)
    }

    public test = async () => {
        console.log('fetching')
        // fetch('/test').then((res) => res.text()).then((text) => console.log(text));
        let text = await (await fetch('/test')).text()
        console.log(text)
    }
}