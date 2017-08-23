export class Player {
    public name: string
    public isReader: boolean
    public isWriter: boolean
    public id: string

    constructor(json: any) {
        this.name = json.name
        this.isReader = json.isReader
        this.isWriter = json.isWriter
        this.id = json.id
    }
}