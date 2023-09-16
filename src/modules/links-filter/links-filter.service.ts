import { Injectable } from '@nestjs/common'
import { path } from 'app-root-path'
import { readFile } from 'fs-extra'
import * as URLParse from 'url-parse'

import { getExtension } from '../../utils'
import { FilterDto } from './dto'
import { BAD_EXTENSIONS } from './links-filter.constants'
import { UrlParts } from './links-filter.types'

@Injectable()
export class LinksFilterService {
  public async filter(dto: FilterDto) {
    const { urls } = dto

    let newUrls = this.filterByEmptyPart(urls, 'pathname')
    newUrls = this.filterByEmptyPart(newUrls, 'host')
    newUrls = this.filterByEmptyPart(newUrls, 'hostname')
    newUrls = this.filterByExtensions(newUrls)
    newUrls = await this.filterByDomain(newUrls)

    return newUrls
  }

  private filterByEmptyPart(urls: string[], part: UrlParts) {
    return urls.filter((url) => {
      const parsedUrl = URLParse(url)
      return parsedUrl[part] !== '/' && parsedUrl[part] !== ''
    })
  }

  private filterByExtensions(urls: string[]) {
    return urls.filter((url) => !BAD_EXTENSIONS.includes(getExtension(url)))
  }

  private async filterByDomain(urls: string[]) {
    const domains = await this.getBlackListDomains()
    return urls.filter((url) => {
      const parsedUrl = URLParse(url)
      return !domains.includes(parsedUrl.host) && !domains.includes(parsedUrl.hostname)
    })
  }

  private async getBlackListDomains() {
    const blacklist = await readFile(`${path}/blacklist.txt`, 'utf8')
    return blacklist
      .split('\n')
      .map((domain) => domain.trim())
      .filter((domain) => domain.length > 0)
  }
}
