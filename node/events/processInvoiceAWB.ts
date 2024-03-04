/* eslint-disable @typescript-eslint/ban-ts-comment */

export async function processInvoiceAWB(
  ctx: any,
  next: () => Promise<any>
) {
  try {
    const { body, clients: {event} } = ctx
    const { externalOrderId, invoicesList, events } = body

    event.updateTrackingData(ctx, externalOrderId, invoicesList, {
      events,
    })

    await next()
  } catch (exception) {
    throw exception
  }
}
