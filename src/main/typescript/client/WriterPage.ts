import { WebPage } from './WebPage'
import { Game } from './Game'
import { WebSocketHandler } from './WebSocketHandler'

export class WriterPage extends WebPage {

    private webSocketHandler: WebSocketHandler

    public constructor() {
        super()
    }

    public getName(): string {
        return "START"
    }

    public load(game: Game) {
        this.webSocketHandler = new WebSocketHandler(this)
    }

    public update(game: Game) {

    }
}