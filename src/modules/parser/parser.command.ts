/* eslint-disable no-console */
import { Injectable } from '@nestjs/common'
import { Command } from 'nestjs-command'

import { ParserService } from './parser.service'

@Injectable()
export class ParserCommand {
  constructor(private readonly parserService: ParserService) {}

  @Command({
    command: 'parser:run',
    describe: 'Parser run',
  })
  public async run() {
    try {
      await this.parserService.run()
    } catch (e) {
      console.error(e)
    }
  }

  @Command({
    command: 'parser:runMultiple',
    describe: 'Parser runMultiple',
  })
  public async runMultiple() {
    try {
      await this.parserService.runMultiple()
    } catch (e) {
      console.error(e)
    }
  }
}
