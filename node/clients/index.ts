import { IOClients } from '@vtex/api'
import { Catalog } from '@vtex/clients'

import CatalogApi from './catalog'
import Events from './events'
import Innoship from './innoship'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get innoship() {
    return this.getOrSet('innoship', Innoship)
  }

  public get event() {
    return this.getOrSet('event', Events)
  }

  public get catalog() {
    return this.getOrSet('catalog', Catalog)
  }

  public get catalogApi() {
    return this.getOrSet('catalogApi', CatalogApi)
  }
}
