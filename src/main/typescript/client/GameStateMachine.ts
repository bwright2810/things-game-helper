import { Game } from './Game'
import { StartPage } from './StartPage'

export class GameStateMachine {
 
    public determinePage = (game: Game): string => {
        return StartPage.TITLE
    }
}