import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { XEvilModule } from '../xevil/xevil.module'
import { MailSearchParserController } from './mail-search-parser.controller'
import { MailSearchParserService } from './mail-search-parser.service'
import { LoggerModule } from '../logger/logger.module'

@Module({
  imports: [ConfigModule, XEvilModule, LoggerModule],
  controllers: [MailSearchParserController],
  providers: [MailSearchParserService],
  exports: [MailSearchParserService],
})
export class MailSearchParserModule {}
