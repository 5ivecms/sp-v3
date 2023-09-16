import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { SiteFillerService } from './modules/site-filler/site-filler.service'

async function bootstrap() {
  const showLogs = Number(process.env.SHOW_LOGS) === 1
  const app = await NestFactory.create(AppModule, {
    logger: !showLogs ? false : ['debug', 'error', 'fatal', 'log', 'verbose', 'warn'],
  })

  app.useGlobalPipes(new ValidationPipe())
  //  app.useLogger(app.get(Logger))
  //  app.useGlobalInterceptors(new LoggerErrorInterceptor())

  await app.listen(process.env.SERVER_PORT || 5000)

  const runOnStart = Number(process.env.RUN_FILL_ON_START)
  if (runOnStart === 1) {
    const siteFillerService = app.get(SiteFillerService)
    await siteFillerService.runFilling()
  }
}

bootstrap()
