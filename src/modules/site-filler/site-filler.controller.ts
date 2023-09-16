import { Controller, Get } from '@nestjs/common'

import { SiteFillerService } from './site-filler.service'

@Controller('api/site-filler')
export class SiteFillerController {
  constructor(private readonly siteFillerService: SiteFillerService) {}

  @Get('run-filling')
  public runFilling() {
    return this.siteFillerService.runFilling()
  }
}
