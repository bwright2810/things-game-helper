import { WebSocketHandler } from './WebSocketHandler'
import { WebPage } from './WebPage'

export class WebSocketHandlerFactory {

    private static instance: WebSocketHandler

    public static buildWebSocketHandler(webPage: WebPage) {
        if (this.instance == null) {
            this.instance = new WebSocketHandler(webPage)
            return this.instance
        } else {
            this.instance.updatePage(webPage)
            return this.instance
        }
    }
}