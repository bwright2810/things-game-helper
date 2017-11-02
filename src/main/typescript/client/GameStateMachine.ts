import { Game } from './Game'
import { StartPage } from './StartPage'
import { SessionManager } from './SessionManager'
import { LobbyPage } from './LobbyPage'

export class GameStateMachine {

    private sessionManager: SessionManager

    public constructor() {
        this.sessionManager = new SessionManager()
    }
 
    public determinePage = (game: Game): string => {
        if (game.state == "JOINING") {
            return LobbyPage.TITLE
        }
    }
}