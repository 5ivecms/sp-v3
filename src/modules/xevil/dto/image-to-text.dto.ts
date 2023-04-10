import { IsString } from 'class-validator'

export class ImageToTextDto {
  @IsString()
  public readonly imageBase64: string
}
