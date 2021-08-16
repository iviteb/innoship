import { json } from 'co-body'

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

export async function requestAwb(ctx: any, next: () => Promise<any>) {
  const body = await json(ctx.req)
  const {
    clients: { innoship: innoshipClient },
  } = ctx

  const response = await innoshipClient.requestAwb(body)

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

export async function requestPriceRates(ctx: any, next: () => Promise<any>) {
  const body = await json(ctx.req)
  const {
    clients: { innoship: innoshipClient },
  } = ctx

  const response = await innoshipClient.requestPriceRates(body)

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
