import { Module } from '@nestjs/common'
import { XEvilController } from './xevil.controller'
import { XEvilService } from './xevil.service'

@Module({
  controllers: [XEvilController],
  exports: [XEvilService],
  providers: [XEvilService],
})
export class XEvilModule {}
