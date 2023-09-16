import { Injectable } from '@nestjs/common'
import { Command } from 'nestjs-command'

import { SiteFillerService } from './site-filler.service'

@Injectable()
export class SiteFillerCommand {
  constructor(private readonly siteFillerService: SiteFillerService) {}

  @Command({
    command: 'siteFiller:run',
    describe: 'Site Fuller run',
  })
  public async runMultiple() {
    try {
      await this.siteFillerService.runFilling()
    } catch (e) {
      console.error(e)
    }
  }
}
