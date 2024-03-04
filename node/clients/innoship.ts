import type { InstanceOptions, IOContext} from '@vtex/api';
import {Apps, ExternalClient} from '@vtex/api'

export default class Innoship extends ExternalClient {
  public missingToken = 'Innoship api token missing!'

  constructor(context: IOContext, options?: InstanceOptions) {
    super('http://api.innoship.io/api', context, options)
  }

  public async getSettings() {
    const apps = new Apps(this.context)
    const appId = process.env.VTEX_APP_ID as string

    return await apps.getAppSettings(appId)
  }

  public generateErrorResponse(type: string, error: string) {
    return {
      response: {
        data: {
          errors: {
            [type]: [error],
          },
        },
      },
    }
  }

  public async requestAwb(body: object): Promise<any> {
    const apps = new Apps(this.context)
    const appId = process.env.VTEX_APP_ID as string
    const settings = await apps.getAppSettings(appId)

    if (!settings.innoshipApiToken) {
      return JSON.stringify(
        this.generateErrorResponse('token', this.missingToken)
      )
    }

    return this.http.post('/Order?api-version=1.0', body, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': settings.innoshipApiToken,
        'X-Vtex-Use-Https': true,
        accept: 'application/json',
        'api-version': '1.0',
      },
    })
  }

  public async getLabel(
    courier: any,
    trackingNumber: any,
    format: any
  ): Promise<string> {
    const apps = new Apps(this.context)
    const appId = process.env.VTEX_APP_ID as string
    const settings = await apps.getAppSettings(appId)

    if (!settings.innoshipApiToken) {
      const response = {
        response: {
          data: {
            errors: {
              token: [this.missingToken],
            },
          },
        },
      }

      return JSON.stringify(response)
    }

    return this.http.get(
      `/Label/by-courier/${courier}/awb/${trackingNumber}?type=PDF&format=${format}&useFile=false&api-version=1.0`,
      {
        headers: {
          'X-Api-Key': settings.innoshipApiToken,
          'X-Vtex-Use-Https': true,
          accept: 'application/pdf',
          'api-version': '1.0',
        },
      }
    )
  }

  public async requestAwbHistory(body: object): Promise<string> {
    const apps = new Apps(this.context)
    const appId = process.env.VTEX_APP_ID as string
    const settings = await apps.getAppSettings(appId)

    if (!settings.innoshipApiToken) {
      const response = {
        response: {
          data: {
            errors: {
              token: [this.missingToken],
            },
          },
        },
      }

      return JSON.stringify(response)
    }

    return this.http.post('/Track/by-awb/with-return?api-version=1.0', body, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': settings.innoshipApiToken,
        'X-Vtex-Use-Https': true,
        accept: 'application/json',
        'api-version': '1.0',
      },
    })
  }

  public async requestPriceRates(body: object): Promise<string> {
    const apps = new Apps(this.context)
    const appId = process.env.VTEX_APP_ID as string
    const settings = await apps.getAppSettings(appId)

    if (!settings.innoshipApiToken) {
      const response = {
        response: {
          data: {
            errors: {
              token: [this.missingToken],
            },
          },
        },
      }

      return JSON.stringify(response)
    }

    return this.http.post('/Price', body, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': settings.innoshipApiToken,
        'X-Vtex-Use-Https': true,
        accept: 'application/json',
        'api-version': '1.0',
      },
    })
  }

  public async getCountries(): Promise<string> {
    const apps = new Apps(this.context)
    const appId = process.env.VTEX_APP_ID as string
    const settings = await apps.getAppSettings(appId)
    if (!settings.innoshipApiToken) {
      const response = {
        response: {
          data: {
            errors: {
              token: [this.missingToken],
            },
          },
        },
      }

      return JSON.stringify(response)
    }

    return this.http.get(`/Location/Countries`, {
      headers: {
        'X-Api-Key': settings.innoshipApiToken,
        'X-Vtex-Use-Https': true,
        accept: 'application/json',
        'api-version': '1.0',
      },
    })
  }

  public async fixedLocations(params: any): Promise<string> {
    const apps = new Apps(this.context)
    const appId = process.env.VTEX_APP_ID as string
    const settings = await apps.getAppSettings(appId)

    if (!settings.innoshipApiToken) {
      const response = {
        response: {
          data: {
            errors: {
              token: [this.missingToken],
            },
          },
        },
      }

      return JSON.stringify(response)
    }

    return this.http.get(`/Location/FixedLocations?${params}`, {
      headers: {
        'X-Api-Key': settings.innoshipApiToken,
        'X-Vtex-Use-Https': true,
        accept: 'application/json',
        'api-version': '1.0',
      },
    })
  }

  public async getLockerSettings(): Promise<string> {
    const apps = new Apps(this.context)
    const appId = process.env.VTEX_APP_ID as string
    const settings = await apps.getAppSettings(appId)

    if (!settings.innoshipApiToken) {
      const response = {
        response: {
          data: {
            errors: {
              token: [this.missingToken],
            },
          },
        },
      }

      return JSON.stringify(response)
    }

    return JSON.stringify({ token: settings.googleMapsApiToken })
  }

  public async getCouriers(): Promise<string> {
    const apps = new Apps(this.context)
    const appId = process.env.VTEX_APP_ID as string
    const settings = await apps.getAppSettings(appId)

    if (!settings.innoshipApiToken) {
      const response = {
        response: {
          data: {
            errors: {
              token: [this.missingToken],
            },
          },
        },
      }

      return JSON.stringify(response)
    }

    return this.http.get(`/Courier/All`, {
      headers: {
        'X-Api-Key': settings.innoshipApiToken,
        'X-Vtex-Use-Https': true,
        accept: 'application/json',
        'api-version': '1.0',
      },
    })
  }
}
