import { json } from 'co-body'
import { formatError } from '../utils/error'
import { createPayload, getTransactionDiscount } from '../utils/mappings'

export async function getLabel(ctx: any, next: () => Promise<any>) {
  const {
    clients: { innoship: innoshipClient },
  } = ctx

  const { courier, trackingNumber, format } = ctx.vtex.route.params
  const response = await innoshipClient.getLabel(
    courier,
    trackingNumber,
    format
  )

  ctx.status = 200
  ctx.body = response

  await next()
}

export async function requestAwbHistory(ctx: any, next: () => Promise<any>) {
  const body = await json(ctx.req)
  const {
    clients: { innoship: innoshipClient },
  } = ctx

  const response = await innoshipClient.requestAwbHistory(body)

  ctx.status = 200
  ctx.body = response

  await next()
}

export async function requestAwb(ctx: any, next: () => Promise<any>) {
  const {
    clients: { oms, logger, innoship },
  } = ctx

  const body = await json(ctx.req) as GenerateAwbRequest
 
  let order: any
  try {
    order = await oms.getOrderId(body.orderId)
  } catch (e) {
    logger.error({
      message: 'Generate AWB',
      error: formatError(e),
    })
    ctx.status = 500
    ctx.body = e.response
    return
  }
  const totalOrderDiscount = body.totalOrderDiscount ?? getTransactionDiscount(order)
  const payload = await createPayload({...body, totalOrderDiscount}, order)
  const response = await innoship.requestAwb(payload)
  ctx.status = 200
  const result = { 
    trackingNumber: response.courierShipmentId,
    trackingUrl: response.trackPageUrl,
    courierId:  response.courier,
    dispatchedDate: response.calculatedDeliveryDate
  } as GenerateAwbResponse

  ctx.body = result

  await next()
}

export async function requestPriceRates(ctx: any, next: () => Promise<any>) {
  const {
    clients: { oms, innoship}
  } = ctx

  const body = await json(ctx.req) as GenerateAwbRequest
  let order: any
  try {
    order = await oms.getOrderId(body.orderId)
  } catch (e) {
    ctx.status = 500
    ctx.body = e.response
    return
  }
  const totalOrderDiscount = body.totalOrderDiscount ?? getTransactionDiscount(order)
  const payload = await createPayload({...body, totalOrderDiscount}, order)
  const response = await innoship.requestPriceRates(payload)
  ctx.status = 200
  ctx.body = response

  await next()
}

export async function innoshipFixedLocations(
  ctx: any,
  next: () => Promise<any>
) {
  const {
    clients: { innoship: innoshipClient },
  } = ctx

  const { params } = ctx.vtex.route.params
  const response = await innoshipClient.fixedLocations(params)

  ctx.status = 200
  ctx.body = response

  await next()
}

export async function innoshipSettings(ctx: any, next: () => Promise<any>) {
  const {
    clients: { innoship: innoshipClient },
  } = ctx

  const response = await innoshipClient.getLockerSettings()

  ctx.status = 200
  ctx.body = response

  await next()
}

export async function getCouriers(ctx: any, next: () => Promise<any>) {
  const {
    clients: {
      innoship,
      masterData,
    },
  } = ctx

  try {
    await masterData.generateSchema(ctx)
  } catch (error) {}

  const couriers = await innoship.getCouriers()

  await masterData.getList(ctx, 'couriers', 'couriers')
    .then(async (response: any) => {
      if (response.length) {
        try {
          await masterData.saveDocuments(ctx, 'couriers', {
            data: couriers,
            type: 'couriers',
            id: response[0].id,
          })
        } catch (error) {}

      } else {
        try {
          await masterData.saveDocuments(ctx, 'couriers', {
            data: couriers,
            type: 'couriers',
          })
        } catch (error) {}
      }
    })

  const storedCouriers = await masterData.getList(ctx, 'couriers', 'couriers')
  ctx.status = 200
  ctx.body = storedCouriers[0].data

  await next()
}

export async function saveCouriers(ctx: any, next: () => Promise<any>) {
  const body = await json(ctx.req)
  const {
    clients: {
      masterData,
    },
  } = ctx

  await masterData.getList(ctx, 'savedCouriers', 'savedCouriers')
    .then(async (response: any) => {
      if (response.length) {
        try {
          const res = await masterData.saveDocuments(ctx, 'savedCouriers', {
            couriers: body,
            type: 'savedCouriers',
            id: response[0].id,
          })
          ctx.body = res
        } catch (error) {}
      } else {
        try {
          const res = await masterData.saveDocuments(ctx, 'savedCouriers', {
            couriers: body,
            type: 'savedCouriers',
          })
          ctx.body = res
        } catch (error) {}
      }
    })

  ctx.status = 200

  await next()
}

export async function getSavedCouriers(ctx: any, next: () => Promise<any>) {
  const {
    clients: {
      masterData,
    },
  } = ctx

  try {
    await masterData.generateSchema(ctx)
  } catch (error) {}

  const response = await masterData.getList(ctx, 'savedCouriers', 'savedCouriers')

  if (response.length) {
    ctx.body = response[0].couriers
  } else {
    ctx.body = {}
  }

  ctx.status = 200

  await next()
}
