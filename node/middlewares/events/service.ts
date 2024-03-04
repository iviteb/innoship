// import constants from '../../constants'

export async function updateAWBs(ctx: any, next: () => Promise<string>) {
  try {
    const {
      clients: {
        innoship,
        event,
        masterData,
        events,
      },
    } = ctx

    const carriers = await masterData.getList(ctx, 'couriers', 'couriers')
    const savedCarriers = await masterData.getList(ctx, 'savedCouriers', 'savedCouriers')

    const mappedCarriers = carriers[0].data.reduce((resp: any, carrier: any) => {
      resp[carrier.courierId] = carrier.courier
      return resp
    }, {})

    let currentPage = 1
    let totalPages = 1
    let allOrders = [] as any
    const awbList = {} as any
    const invoicesList = {} as any

    do {
      const orders = await event.getOrders(ctx, currentPage)

      allOrders = [...allOrders, ...orders.list]
      currentPage = orders.paging.currentPage + 1
      totalPages = orders.paging.pages > 30 ? 30 : orders.paging.pages
    } while (currentPage <= totalPages)

    // @ts-ignore
    const reverseCourier = Object.assign({}, ...Object.entries(mappedCarriers).map(([a, b]) => ({[b]: a,})))

    // @ts-ignore
    const reverseSavedCourier = (savedCarriers && savedCarriers.length && savedCarriers[0]?.couriers) ? Object.assign({}, ...Object.entries(savedCarriers[0]?.couriers).map(([a, b]) => ({[b]: a,}))) : {}

    await Promise.all(allOrders.map(async (item: any) => {
      await event.getOrder(ctx, item.orderId)
        .then(async (order: any) => {
          if (
            order.packageAttachment.packages &&
            order.packageAttachment.packages.length
          ) {
            const packageItem = order.packageAttachment.packages[0]
            const {
              trackingNumber,
              courier,
              invoiceNumber,
            } = packageItem

            if (
              trackingNumber
              && invoiceNumber
              && reverseCourier.hasOwnProperty(courier)
              && (reverseSavedCourier.hasOwnProperty(courier) || !Object.keys(reverseSavedCourier).length)
            ) {

              let skip = false
              if (order?.packageAttachment?.packages[0]?.courierStatus?.data) {
                order.packageAttachment.packages[0].courierStatus.data.map(async (item: any) => {
                  if (item.description === 'Canceled' || item.description === 'Canceled by Carrier' || item.description === 'Delivered') {
                    skip = true
                  }
                })
              }

              if (!skip) {
                awbList[courier] = awbList.hasOwnProperty(courier) ? [ ...awbList[courier], ...[trackingNumber] ] : [trackingNumber]
                invoicesList[order.orderId] = invoiceNumber
              }
            }
          }
        })
    }))

    Object.entries(awbList).forEach(([key, value]) => {
      innoship.requestAwbHistory({
        awbList: value,
        courier: key,
      })
        .then((data: any) => {
          data.map((awb: any) => {
            if (awb.hasOwnProperty('history')) {
              const eventsData = awb.history.map((currentEvent: any) => {
                return {
                  date: currentEvent.eventDate,
                  description: currentEvent.clientStatusDescription,
                }
              })
              events.sendEvent('', 'vtex.invoiceAWB', { externalOrderId: awb.externalOrderId, invoicesList: invoicesList[awb.externalOrderId], events: eventsData })
            }
          })
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

    const locations = await innoship.fixedLocations('ShowInactive=true')
    const settings = await innoship.getSettings()
    const countryInfo = await innoship.getCountries()

    locations.map((location: any) => {
      events.sendEvent('', 'innoship.pickupPoint', { settings, location, countryInfo })
    })

    ctx.body = 'OK'
    await next()
  } catch (exception) {
    throw exception
  }
}
