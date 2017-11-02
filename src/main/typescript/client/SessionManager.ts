import * as Cookies from 'js-cookie'
import { Cookie } from './Cookie'

export class SessionManager {

    private static COOKIE_SYMBOL = "things"

    public isLoggedIn = (): boolean => {
        return this.getCookie() != null
    }

    public getCurrentUserName = (): string => {
        let cookie = this.getCookie()
        if (cookie == null) {
            return null
        }

        return cookie.name
    }

    public getGameId = (): string => {
        let cookie = this.getCookie()
        if (cookie == null) {
            return null
        }

        return cookie.gameId
    }
    
    private getCookie = (): Cookie => {
        let cookieString = Cookies.get(SessionManager.COOKIE_SYMBOL)
        if (cookieString == null) {
            return null
        }
        return Cookie.fromValue(cookieString)
    }

    public saveCookie = (cookie: Cookie) => {
        Cookies.set(SessionManager.COOKIE_SYMBOL, cookie.toValue())
    }

    public hasCookie = (): boolean => {
        return this.getCookie() != null
    }

    public isCreator = (): boolean => {
        return this.getCookie() != null && this.getCookie().isCreator
    }

    public clearSession = () => {
        Cookies.remove(SessionManager.COOKIE_SYMBOL)
    }

    public getPlayerId = (): string => {
        if (this.hasCookie()) {
            return this.getCookie().playerId
        } else {
            return null
        }
    }
}