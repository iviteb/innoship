import { AWB_CONTENT, AWB_SOURCE_CHANNEL, DEFAULT_COUNTRY, DEFAULT_ENVELOPE_COUNT, DEFAULT_PALETTES_COUNT, DEFAULT_SERVICE_ID, PICKUP, PICKUP_SERVICE_ID, PRICE_MULTIPLIER, PROMISSORY } from "./constants"

export async function createPayload (
    body: GenerateAwbRequest, order: any
): Promise<PayloadInnoship> {
    let weight = 0
    const parcels: Parcel[] = []
    let {value} = order

    if (body?.totalWeight === 0) {
      order.items.reduce(
        (weight: any, item: any) =>
          weight + item.additionalInfo.dimension.weight * item.quantity
      )
    } else {
      weight = body.totalWeight
    }

    if (body.numberOfParcels > 1) {
      for (let i = 1; i <= body.numberOfParcels; i++) {
        parcels.push(mapParcels(i, body.parcelWeights[i]))
      }
    } else {
      parcels.push(mapParcels(1, weight))
    }
   
    const {warehouseId} = order.shippingData.logisticsInfo[0].deliveryIds[0]
    const {firstDigits} = order.paymentData.transactions[0].payments[0]
    const paymentPromissory =
      order.paymentData.transactions[0].payments[0].group ===
      PROMISSORY

    value += body.totalOrderDiscount
    const payment =
      firstDigits || paymentPromissory
        ? 0
        : value / PRICE_MULTIPLIER
       
        const payload = {
          serviceId: order.shippingData.address.addressType === PICKUP ? PICKUP_SERVICE_ID: DEFAULT_SERVICE_ID,
          shipmentDate: new Date().toISOString(),
          addressFrom: null,
          addressTo: mapAddresses(order, body.phoneNumbers, body.emails),
          payment: body.shipmentPaymentMethod,
          content: {
            envelopeCount: DEFAULT_ENVELOPE_COUNT,
            parcelsCount: body.numberOfParcels,
            palettesCount: DEFAULT_PALETTES_COUNT,
            totalWeight: weight,
            contents: AWB_CONTENT,
            parcels,
          },
          externalClientLocation: warehouseId,
          externalOrderId: order.orderId,
          sourceChannel: AWB_SOURCE_CHANNEL,
          extra: {
            bankRepaymentAmount: payment,
          },
          courierId: body.courierId
        }
    
       
      return payload
}

export const mapParcels = (
    i: number, 
    weight: number
): Parcel => ({
    sequenceNo: i,
    weight: weight,
    type: "2",
    reference1: `Parcel ${i}`,
    size: {width: 1, height: 1, length: 1}
})

export function mapAddresses (
    order: any, phoneNumbers: string[] | undefined, emails: string[] | undefined
): Address {
  const {address} = order.shippingData
    const addressText = [
      address.street,
      address.number,
      address.neighborhood,
      address.complement,
      address.reference,
    ]
      .filter(Boolean)
      .join(', ')
      
    const result = {
      name: address.receiverName,
      contactPerson: address.receiverName,
      country: DEFAULT_COUNTRY,
      countyName: address.state,
      localityName: address.city,
      addressText,
      postalCode: address.postalCode,
      phone: phoneNumbers?.length ? phoneNumbers[0] : order.clientProfileData.phone,
      email: emails?.length ? emails[0] : order.clientProfileData.email
    }
    if (order.shippingData.address.addressType === PICKUP) 
        return {
        ...result,
        fixedLocationId: order.shippingData.address.addressId,
        localityId: order.shippingData.address.neighborhood,
        countyName: order.shippingData.address.state,
        localityName: order.shippingData.address.city,
        addressText: order.shippingData.address.street,
        postalCode: order.shippingData.address.postalCode
      }
      return result
}

export function getTransactionDiscount(order: any) {
  let totalOrderDiscount: number = 0

  if (order.paymentData.giftCards.length) {
    totalOrderDiscount += order.paymentData.transactions[0].payments.reduce(
      function (result: number, it: { redemptionCode: any; value: number }) {
        if (it.redemptionCode) {
          result -= it.value;
        }
        return result
      },
      0
    );
  }

  if (order.changesAttachment) {
    order.changesAttachment.changesData.forEach((item: any) => {
      if (item.itemsAdded.length) {
        if (item.incrementValue === 0) {
          totalOrderDiscount += item.itemsAdded.reduce(function (result: number, it: { price: number; quantity: number }) {
            result += it.price * it.quantity;

            return result
          }, 0)
        }
      }

      if (item.itemsRemoved.length) {
        if (item.discountValue === 0) {
          totalOrderDiscount -= item.itemsRemoved.reduce(function (
            result: number,
            it: { price: number; quantity: number }
            ) {
              result += it.price * it.quantity;

              return result
            },
          0)
        }
      }
    });
  }
  return totalOrderDiscount
}
