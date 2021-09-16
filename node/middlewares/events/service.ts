// import constants from '../../constants'

export async function updateAWBs(ctx: any, next: () => Promise<string>) {
  try {
    const {
      clients: { innoship, event, masterData },
    } = ctx

    const carriers = await masterData.getList(ctx, 'couriers', 'couriers')
    const savedCarriers = await masterData.getList(ctx, 'savedCouriers', 'savedCouriers')

    let currentPage = 1
    let totalPages = 1
    let allOrders = [] as any

    do {
      const orders = await event.getOrders(ctx, currentPage)

      allOrders = [...allOrders, ...orders.list]
      currentPage = orders.paging.currentPage + 1
      totalPages = orders.paging.pages > 30 ? 30 : orders.paging.pages
    } while (currentPage <= totalPages)

    // @ts-ignore
    const reverseCourier = Object.assign({}, ...Object.entries(carriers).map(([a, b]) => ({[b]: a,})))

    // @ts-ignore
    const reverseSavedCourier = Object.assign({}, ...Object.entries(savedCarriers).map(([a, b]) => ({[b]: a,})))

    allOrders.map((item: any) => {
      event.getOrder(ctx, item.orderId).then((order: any) => {
        if (
          order.packageAttachment.packages &&
          order.packageAttachment.packages.length
        ) {
          const packageItem = order.packageAttachment.packages[0]
          const { trackingNumber, courier, invoiceNumber } = packageItem

          if (trackingNumber && invoiceNumber && (reverseSavedCourier.hasOwnProperty(courier) || !Object.keys(reverseSavedCourier).length)) {

            let skip = false
            if (order?.packageAttachment?.packages[0]?.courierStatus?.data) {
              order.packageAttachment.packages[0].courierStatus.data.map((item: any) => {
                if (item.description === 'Canceled' || item.description === 'Canceled by Carrier' || item.description === 'Delivered') {
                  skip = true
                }
              })
            }

            if (!skip) {
              const payload = {
                awbList: [trackingNumber],
                courier: reverseCourier[courier],
              }

              innoship.requestAwbHistory(payload).then((data: any) => {
                if (
                  data.length &&
                  data[0].hasOwnProperty('history')
                ) {
                  const {history} = data[0]
                  const events = history.map((currentEvent: any) => {
                    return {
                      date: currentEvent.eventDate,
                      description: currentEvent.clientStatusDescription,
                    }
                  })

                  event.updateTrackingData(ctx, order.orderId, invoiceNumber, {
                    events,
                  })
                }
              })
            }
          }
        }
      })
    })

    ctx.body = 'OK'
    await next()
  } catch (exception) {
    throw exception
  }
}

export async function getScheduler(ctx: any, next: () => Promise<any>) {
  const {
    clients: { event },
  } = ctx

  const response = await event.getScheduler(ctx)

  ctx.status = 200
  ctx.body = response

  await next()
}

export async function deleteScheduler(ctx: any, next: () => Promise<any>) {
  const {
    clients: { event },
  } = ctx

  const response = await event.deleteScheduler(ctx)

  ctx.status = 200
  ctx.body = response

  await next()
}

export async function setScheduler(ctx: any, next: () => Promise<any>) {
  const {
    clients: { event },
  } = ctx

  const response = await event.setScheduler(ctx)

  ctx.status = 200
  ctx.body = response

  await next()
}

export async function processPickupPoints(
  ctx: any,
  next: () => Promise<string>
) {
  try {
    const {
      clients: { events, innoship },
    } = ctx

    const locations = await innoship.fixedLocations('')
    const settings = await innoship.getSettings()

    locations.map((location: any) => {
      if (location.countryCode === 'RO') {
        events.sendEvent('', 'innoship.pickupPoint', { settings, location })
      }
    })

    ctx.body = 'OK'
    await next()
  } catch (exception) {
    throw exception
  }
}
