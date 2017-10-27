import { Game } from './Game'

export class Message {

    public game: Game;
    public command: string;

    public constructor (game: Game, command: string) {
        this.game = game;
        this.command = command;
    }
}