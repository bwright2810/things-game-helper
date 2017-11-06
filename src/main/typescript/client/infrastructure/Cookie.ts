export class Cookie {

    public gameId: string
    public playerId: string
    public name: string
    public isCreator: boolean

    constructor(gameId: string, playerId: string, name: string, isCreator: boolean) {
        this.gameId = gameId
        this.playerId = playerId
        this.name = name
        this.isCreator = isCreator
    }

    public static fromValue(cookieValue: string): Cookie {
        let [gameId, playerId, name, isCreatorString] = cookieValue.split("|")
        const isCreator = isCreatorString == "true"
        return new Cookie(gameId, playerId, name, isCreator)
    }

    public toValue = (): string => {
        const creatorString = this.isCreator ? "true" : "false"
        return `${this.gameId}|${this.playerId}|${this.name}|${creatorString}`
    }
}