import { ChainablePromiseElement } from 'webdriverio'
import { SearchParserResult } from '../../types/search-parser'

type CaptchaInfo = {
  x: number
  y: number
  width: number
  height: number
}

export interface MailSearchPage {
  readonly jsPlaceholder: ChainablePromiseElement<WebdriverIO.Element>
  readonly captchaBlock: ChainablePromiseElement<WebdriverIO.Element>
  readonly captchaImg: ChainablePromiseElement<WebdriverIO.Element>
  readonly captchaField: ChainablePromiseElement<WebdriverIO.Element>
  readonly captchaButton: ChainablePromiseElement<WebdriverIO.Element>
  readonly hasCaptcha: () => Promise<boolean>
  readonly submitCaptcha: () => Promise<void>
  readonly getCaptchaInfo: () => Promise<CaptchaInfo>
  readonly getSearchResultUrls: (keyword: string) => Promise<SearchParserResult | null>
  readonly open: () => Promise<void>
  readonly close: () => Promise<void>
  readonly deleteSession: () => Promise<void>
  readonly reloadSession: () => Promise<void>
  readonly openUrl: (url: string) => Promise<void>
}
