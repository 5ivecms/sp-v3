import { Injectable } from '@nestjs/common'
import * as ac from '@antiadmin/anticaptchaofficial'
import { readFile } from 'fs-extra'

@Injectable()
export class XEvilService {
  public async imageFileToText(file: Express.Multer.File): Promise<string | false> {
    const captcha = file.buffer.toString('base64')
    return await this.imageToText(captcha)
  }

  public async imageToText(imageBase64: string): Promise<string | false> {
    ac.settings.isVerbose = false
    ac.settings.firstAttemptWaitingInterval = 1
    ac.settings.normalWaitingInterval = 1

    ac.setSoftId(0)

    try {
      return await ac.solveImage(imageBase64, true)
    } catch (e) {
      return false
    }
  }

  public async imageFromFileToText(filePath: string) {
    const file = (await readFile(filePath)).toString('base64')
    return await this.imageToText(file)
  }
}
