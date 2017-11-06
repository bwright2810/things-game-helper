export class Player {
    public name: string
    public role: string
    public id: string

    constructor(json: any) {
        this.name = json.name
        this.role = json.role
        this.id = json.id
    }
}