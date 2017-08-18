import * as $ from 'jquery';
import * as izitoast from 'izitoast';

export class ThingsApp {

    private socket: WebSocket;

    constructor() {
        this.openWs();
    }

    private openWs = () => {
        this.socket = new WebSocket('ws://localhost:4567/echo');

        this.socket.addEventListener('open', (event) => {
            console.log("Echo WS opened");
        });

        this.socket.addEventListener('close', (event) => {
            console.log("Echo WS closed. Re-opening.");
            this.openWs();
        });
    }

    private reopenWsIfNeeded = () => {
        if (this.socket.readyState != 1) {
            this.openWs();
        }
    }

    public joinGame = () => {
        const error = this.validate(true);
        if (error != null) {
            this.errorMsg(error);
            return;
        }

        const textField = document.getElementById("game-id");
        const text = (<any>textField).value;
        console.log("Sending: " + text);
        this.socket.send(text);
    }

    public newGame = () => {
        const error = this.validate(false);

        if (error != null) {
            this.errorMsg(error);
            return;
        }

        const nick = this.inputValue($('#name').get(0));

        $.post('/create', { nickname: nick }).then(res => console.log(res)).catch(err => this.errorMsg(err));
    }

    private errorMsg = (msg: string) => {
        izitoast.error({ title: "Hey friend!", message: msg, position: 'topLeft', timeout: 10000 });
    }

    private validate = (joining: boolean): string => {
        const nick = this.inputValue($('#name').get(0));

        if (nick == "") {
            return "Please enter a nickname";
        }

        if (joining) {
            const gameId = this.inputValue($('#game-id').get(0));

            if (gameId == "") {
                return "Please enter ID of game to join";
            }
        }

        return null;
    }

    private inputValue(element: HTMLElement): string {
        return (<HTMLInputElement> element).value;
    }

    public test = async () => {
        console.log('fetching');
        // fetch('/test').then((res) => res.text()).then((text) => console.log(text));
        let text = await (await fetch('/test')).text();
        console.log(text);
    }
}