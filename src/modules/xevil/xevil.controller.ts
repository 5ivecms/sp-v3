import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ImageToTextDto } from './dto'
import { XEvilService } from './xevil.service'

@Controller('api/xevil')
export class XEvilController {
  constructor(private readonly xevilService: XEvilService) {}

  @Post('image-file-to-text')
  @UseInterceptors(FileInterceptor('file'))
  public imageFileToText(@UploadedFile() file: Express.Multer.File) {
    return this.xevilService.imageFileToText(file)
  }

  @Post('image-to-text')
  public imageToText(@Body() dto: ImageToTextDto) {
    return this.xevilService.imageToText(dto.imageBase64)
  }
}
