import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { BrowserController } from './browser.controller'
import { BrowserService } from './browser.service'
import { LoggerModule } from '../logger/logger.module'

@Module({
  imports: [ConfigModule, LoggerModule],
  controllers: [BrowserController],
  exports: [BrowserService],
  providers: [BrowserService],
})
export class BrowserModule {}
