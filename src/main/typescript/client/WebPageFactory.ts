import { WebPage } from './WebPage'
import { StartPage } from './StartPage'

export class WebPageFactory {

    private static WEB_PAGES = [ new StartPage() ]

    public static getPage(page: string): WebPage {
        for (const page of WebPageFactory.WEB_PAGES) {
            if (page == name) {
                return page
            }
        }
        return null
    }
}