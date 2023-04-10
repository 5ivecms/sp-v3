import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino'

import { AppModule } from './app.module'

async function bootstrap() {
  //const app = await NestFactory.create(AppModule, { bufferLogs: true })
  const app = await NestFactory.create(AppModule, { logger: console })
  app.useGlobalPipes(new ValidationPipe())
  app.useLogger(app.get(Logger))
  app.useGlobalInterceptors(new LoggerErrorInterceptor())
  const server = await app.listen(process.env.SERVER_PORT || 5000)
  //server.setTimeout(120 * 1000)
}
//AppClusterService.clusterize(bootstrap)
bootstrap()
