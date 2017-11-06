import { Player } from './Player'

export class Game {

    public id: string
    public players: Player[]
    public state: string
    public creatorName: string

    public constructor(json: any) {
        this.id = json.id
        this.players = []
        for (let playerJson of json.players) {
            this.players.push(new Player(playerJson))
        }
        this.state = json.state
        this.creatorName = json.creatorName
    }

    public isPlayerReader = (playerId: string) => {
        for (let player of this.players) {
            if (player.id == playerId) {
                return player.role == "READER"
            }
        }
        return false
    }
}