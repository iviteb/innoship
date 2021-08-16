import type { InstanceOptions, IOContext} from '@vtex/api'
import {JanusClient} from '@vtex/api'

export default class Events extends JanusClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(context, options)
  }

  public async getOrders(ctx: any, page: any): Promise<any> {
    return this.http.get(
      `/api/oms/pvt/orders?&page=${page}&f_status=invoiced`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          VtexIdclientAutCookie: ctx.vtex.authToken,
        },
      }
    )
  }

  public async getOrder(ctx: any, orderId: any): Promise<any> {
    return this.http.get(`/api/oms/pvt/orders/${orderId}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        VtexIdclientAutCookie: ctx.vtex.authToken,
      },
    })
  }

  public async updateTrackingData(
    ctx: any,
    orderId: any,
    invoiceNumber: any,
    body: any
  ): Promise<any> {
    return this.http.put(
      `/api/oms/pvt/orders/${orderId}/invoice/${invoiceNumber}/tracking`,
      body,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          VtexIdclientAutCookie: ctx.vtex.authToken,
        },
      }
    )
  }

  public async getScheduler(ctx: any): Promise<any> {
    return this.http.get(
      `/api/scheduler/master/innoship/sync-innoship-awb-status?version=4`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          VtexIdclientAutCookie: ctx.vtex.authToken,
        },
      }
    )
  }

  public async setScheduler(ctx: any): Promise<any> {
    const body = {
      id: 'sync-innoship-awb-status',
      request: {
        method: 'POST',
        uri: `https://${this.context.host}/no-cache/update-awbs`,
      },
      retry: {
        backOffRate: 1.0,
        delay: {
          addMinutes: 3,
        },
        times: 1,
      },
      scheduler: {
        endDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 5)
        ).toISOString(),
        expression: '0 */4 * * *',
      },
    }

    return this.http.post('/api/scheduler/master/innoship/?version=4', body, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        VtexIdclientAutCookie: ctx.vtex.authToken,
      },
    })
  }

  public async deleteScheduler(ctx: any): Promise<any> {
    return this.http.delete(
      `/api/scheduler/master/innoship/sync-innoship-awb-status?version=4`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          VtexIdclientAutCookie: ctx.vtex.authToken,
        },
      }
    )
  }
}
