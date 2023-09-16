import { Page } from 'puppeteer'

const TIMEOUT = 1000

export class YandexSearchPage {
  private readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  public async open(keyword: string, pageNum: number) {
    await this.page.goto(`https://yandex.ru/search/?text=${keyword}&search_source=dzen_desktop_safe&p=${pageNum - 1}`, {
      waitUntil: 'domcontentloaded',
    })
  }

  public async openHomePage() {
    await this.page.goto(`https://yandex.ru/search/`, { waitUntil: 'domcontentloaded' })
  }

  public async focusMainPageSearchInput() {
    await this.page.waitForSelector('.HeaderDesktopForm-Input', { timeout: TIMEOUT })
    await this.page.click('.HeaderDesktopForm-Input')
  }

  public async submitSearch() {
    try {
      await this.page.waitForSelector('.HeaderDesktopForm-Submit', { timeout: TIMEOUT })
      await this.page.click('.HeaderDesktopForm-Submit')
    } catch (e) {
      console.error(e)
    }
  }

  public async clearSearch() {
    try {
      await this.page.click('button.HeaderDesktopForm-Clear')
    } catch (e) {
      console.error(e)
    }
  }

  public getPage() {
    return this.page
  }

  public async getSiteUrls() {
    try {
      await this.page.waitForSelector('.main.serp', { timeout: TIMEOUT })

      const items = await this.page.$$(
        '.content__left .serp-list .serp-item:not([data-fast-name="video-unisearch"]) .OrganicTitle .OrganicTitle-Link'
      )

      const urls: string[] = []
      for (const item of items) {
        const url = await this.page.evaluate((el) => el.getAttribute('href'), item)
        urls.push(url)
      }

      return urls.filter((url) => url.indexOf('yabs.yandex') === -1)
    } catch (e) {
      return []
    }
  }
}
