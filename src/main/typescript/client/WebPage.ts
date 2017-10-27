import { Game } from './Game'

export abstract class WebPage {

    public abstract load(game: Game)

    public abstract update(game: Game)

    public abstract getName(): string
}