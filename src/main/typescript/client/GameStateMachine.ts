import { Game } from './Game'
import { StartPage } from './StartPage'
import { SessionManager } from './SessionManager'
import { LobbyPage } from './LobbyPage'
import { ResponsePage } from './ResponsePage'
import { GuessingPage } from './GuessingPage'

export class GameStateMachine {

    private sessionManager: SessionManager

    public constructor() {
        this.sessionManager = new SessionManager()
    }
 
    public determinePage = (game: Game): string => {
        if (game.state == "JOINING" || game.state == "PICKING") {
            return LobbyPage.TITLE
        } else if (game.state == "WRITING_PENDING" || game.state == "WRITING_SUBMITTED") {
            return ResponsePage.TITLE
        } else if (game.state == "READING") {
            if (game.isPlayerReader(this.sessionManager.getPlayerId())) {
                return GuessingPage.TITLE
            } else {
                return ResponsePage.TITLE
            }
        } else if (game.state == "GUESSING" || game.state == "ROUND_OVER") {
            return GuessingPage.TITLE
        }
    }
}