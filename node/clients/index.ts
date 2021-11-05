import { IOClients } from '@vtex/api'
import { Catalog } from '@vtex/clients'
import CatalogApi from './catalog'
import Events from './events'
import Innoship from './innoship'
import Masterdata from './masterdata'
import Oms from './oms'


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

  public get masterData() {
    return this.getOrSet('masterData', Masterdata)
  }

  public get oms() {
    return this.getOrSet('oms', Oms)
  }
}
