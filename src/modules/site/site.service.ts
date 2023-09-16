import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

import { DbServerConfig } from '../../config/dbServer.config'
import { SiteConfig } from '../../config/site.config'
import { Site } from './types'

@Injectable()
export class SiteService {
  constructor(private readonly configService: ConfigService) {}

  public async getSite(): Promise<Site> {
    const { host } = this.configService.get<DbServerConfig>('dbServer')
    const { id } = this.configService.get<SiteConfig>('site')
    const { data } = await axios.get<Site>(`${host}/api/site/${id}`)
    return data
  }
}
