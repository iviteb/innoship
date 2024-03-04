import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'
import { PickupPoint } from '../middlewares/utils/PickupPoint'

export default class CatalogApi extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(`http://${context.account}.vtexcommercestable.com.br/api`, context, {
      ...options,
      headers: {
        ...(options?.headers ?? {}),
        'Content-Type': 'application/json',
        // tslint:disable-next-line:object-literal-sort-keys
        Accept: 'application/json',
        'X-Vtex-Use-Https': 'true',
      },
    })
  }

  public async getProductVariations(ctx: any, productId: any): Promise<any> {
    return this.http.get(
      `/catalog_system/pub/products/variations/${productId}`,
      {
        headers: {
          VtexIdclientAutCookie: ctx.vtex.authToken,
        },
      }
    )
  }

  public async saveInnoshipLocationsToCatalog(ctx: any, data: PickupPoint): Promise<any>{
    return this.http.put(`/logistics/pvt/configuration/pickuppoints/${data.id}`, data, {
      headers: {
        VtexIdclientAutCookie: ctx.vtex.authToken,
      },
    })
  }
}
