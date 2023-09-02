import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: console })

  app.useGlobalPipes(new ValidationPipe())
  app.useLogger(app.get(Logger))
  app.useGlobalInterceptors(new LoggerErrorInterceptor())

  await app.listen(process.env.SERVER_PORT || 5000)
}

bootstrap()