import { Body, Controller, Post } from '@nestjs/common'

import { ParseDto } from './dto'
import { Parser2Service } from './parser2.service'

@Controller('api/parser2')
export class Parser2Controller {
  constructor(private readonly parser2Service: Parser2Service) {}

  @Post('parse')
  public parse(@Body() dto: ParseDto) {
    return this.parser2Service.parse(dto)
  }
}
