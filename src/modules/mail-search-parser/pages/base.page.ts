export default class BasePage {
  constructor(protected readonly browser: WebdriverIO.Browser) {}

  public async open(path: string): Promise<void> {
    await this.browser.url(path)
  }

  public async minimizeWindow() {
    await this.browser.minimizeWindow()
  }

  public async closeWindow() {
    await this.browser.closeWindow()
  }

  public async deleteSession() {
    await this.browser.deleteSession()
  }

  public async reloadSession() {
    await this.browser.reloadSession()
  }

  public async newWindow(url: string) {
    await this.browser.newWindow(url)
  }

  public async saveScreenshot(filepath: string) {
    await this.browser.saveScreenshot(filepath)
  }

  public async waitLoad() {
    await this.browser.waitUntil(() => this.browser.execute(() => document.readyState === 'complete'))
  }
}
