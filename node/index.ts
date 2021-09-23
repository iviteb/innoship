import type {ClientsConfig, RecorderState, ServiceContext} from '@vtex/api'
import { LRUCache, method, Service} from '@vtex/api'

import { Clients } from './clients'
import { processPickupPoint } from './events/processPickupPoint'
import {getProductVariation, getSkuById} from './middlewares/catalog'
import {
  deleteScheduler,
  getScheduler,
  processPickupPoints,
  setScheduler,
  updateAWBs,
} from './middlewares/events/service'
import {
  getCouriers,
  getLabel, getSavedCouriers,
  innoshipFixedLocations,
  innoshipSettings,
  requestAwb,
  requestAwbHistory,
  requestPriceRates, saveCouriers,
} from './middlewares/innoship'

const TIMEOUT_MS = 10 * 1000

const memoryCache = new LRUCache<string, any>({ max: 5000 })

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      diskCache: undefined,
      headers: {
        'Cache-Contol': 'no-store',
      },
      memoryCache: undefined,

      timeout: TIMEOUT_MS,
    },
    events: {
      concurrency: 1,
      exponentialBackoffCoefficient: 2,
      exponentialTimeoutCoefficient: 2,
      initialBackoffDelay: 50,
      retries: 1,
      timeout: TIMEOUT_MS,
    },
    status: {
      memoryCache,
    },
  },
}

declare global {
  type Context = ServiceContext<Clients, State>

  interface State extends RecorderState {
    payload?: any
  }
}

export default new Service({
  clients,
  events: {
    pickupPoint: processPickupPoint,
  },
  routes: {
    fixedLocations: method({
      GET: innoshipFixedLocations,
    }),
    getSettings: method({
      GET: innoshipSettings,
    }),
    printLabel: method({
      GET: getLabel,
    }),
    requestAWB: method({
      POST: requestAwb,
    }),
    requestAWBHistory: method({
      POST: requestAwbHistory,
    }),
    requestPriceRates: method({
      POST: requestPriceRates,
    }),
    scheduler: method({
      DELETE: deleteScheduler,
      GET: getScheduler,
      POST: setScheduler,
    }),
    syncPickupPoints: method({
      POST: [processPickupPoints],
    }),
    updateAWBs: method({
      POST: updateAWBs,
    }),
    // tslint:disable-next-line:object-literal-sort-keys
    getSkuById: method({
      GET: getSkuById,
    }),
    getProductVariation: method({
      GET: getProductVariation,
    }),
    getCouriers: method({
      GET: getCouriers,
    }),
    saveCouriers: method({
      POST: saveCouriers,
    }),
    getSavedCouriers: method({
      GET: getSavedCouriers,
    }),
  },
})
