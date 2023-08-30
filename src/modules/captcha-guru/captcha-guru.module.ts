import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { CaptchaGuruController } from './captcha-guru.controller'
import { CaptchaGuruService } from './captcha-guru.service'
import { LoggerModule } from '../logger/logger.module'

@Module({
  imports: [ConfigModule, LoggerModule],
  controllers: [CaptchaGuruController],
  providers: [CaptchaGuruService],
  exports: [CaptchaGuruService],
})
export class CaptchaGuruModule {}
