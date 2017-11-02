import { WebPage } from './WebPage'
import { StartPage } from './StartPage'
import { LobbyPage } from './LobbyPage'

export class WebPageFactory {

    public static webPages: Array<WebPage> = null

    public static getPage(pageName: string): WebPage {
        if (WebPageFactory.webPages == null) {
            WebPageFactory.webPages = [ new StartPage(), new LobbyPage() ]
        }

        for (const webPage of WebPageFactory.webPages) {
            if (webPage.getName() == pageName) {
                return webPage
            }
        }
        return null
    }
}