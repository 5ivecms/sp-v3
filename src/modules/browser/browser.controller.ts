import { Controller, Get } from '@nestjs/common'

import { BrowserService } from './browser.service'

@Controller('api/browser')
export class BrowserController {
  constructor(private readonly browserService: BrowserService) {}

  @Get('init-browser')
  public test() {
    return this.browserService.initBrowser()
  }
}
