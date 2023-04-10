import { Controller, Get } from '@nestjs/common'

import { ParserService } from './parser.service'

@Controller('api/parser')
export class ParserController {
  constructor(private readonly parserService: ParserService) {}

  @Get('run')
  public run() {
    return this.parserService.run()
  }

  @Get('run-multiple')
  public runMultiple() {
    return this.parserService.runMultiple()
  }
}
