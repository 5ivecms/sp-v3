import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

import { DbServerConfig } from '../../config/dbServer.config'
import { SiteConfig } from '../../config/site.config'
import { Keyword } from './types'

@Injectable()
export class KeywordsService {
  constructor(private readonly configService: ConfigService) {}

  public async getKeywords(limit: number = 10) {
    const { host } = this.configService.get<DbServerConfig>('dbServer')
    const { id } = this.configService.get<SiteConfig>('site')
    const { data } = await axios.get<Keyword[]>(`${host}/api/keywords/by-site/${id}?limit=${limit}`)
    return data
  }

  public async setCompleted(id: number) {
    const { host } = this.configService.get<DbServerConfig>('dbServer')
    const { data } = await axios.post(`${host}/api/keywords/${id}/set-completed`)
    return data
  }

  public async setError(id: number) {
    const { host } = this.configService.get<DbServerConfig>('dbServer')
    const { data } = await axios.post(`${host}/api/keywords/${id}/set-error`)
    return data
  }
}
