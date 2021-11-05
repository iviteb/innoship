interface PayloadInnoship {
    serviceId: number
    shipmentDate: string
    addressTo: Address
    payment: string
    courierId: number
    content: Content
    externalClientLocation: string
    externalOrderId: string
    sourceChannel: string
    extra: Extra
}


interface Address {
    name: string
    contactPerson: string
    country: string
    countyName: string
    localityName: string
    addressText: string
    postalCode: string
    localityId?: string
    phone: string
    email: string
    fixedLocationId?: string
}

interface Content {
    envelopeCount: number
    parcelsCount: number
    palettesCount: number
    totalWeight: number
    contents: string
    parcels: Parcel[]
}

interface Extra {
    bankRepaymentAmount: number
}

interface Parcel {
    sequenceNo: number
    weight: number
    type: string
    reference1: string
    size: Size
}

interface Size {
    width: number
    height: number
    length: number
}

interface GenerateAwbRequest {
    totalOrderDiscount? : number
    numberOfParcels: number
    totalWeight: number
    parcelWeights: number[]
    shipmentPaymentMethod: string
    courierId: number
    orderId: string
}

interface GenerateAwbResponse {
    trackingNumber: string
    trackingUrl: string
    dispatchedDate: string
    courierId: string
}