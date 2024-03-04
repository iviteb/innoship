import { PickupPointHours } from "./PickupPointHours";

export interface PickupPoint {
    address : {
        city: string,
        complement: string,
        country: {
            acronym: string,
            name: string
        },
        location: {
            latitude: number,
            longitude: number
        },
        neighborhood: string,
        postalCode: string,
        state: string,
        street: string,
    },
    businessHours: PickupPointHours[],
    description: string,
    formatted_address: string,
    id: string,
    instructions: string,
    isActive: boolean,
    isThirdPartyPickup: boolean,
    name: string,
    tagsLabel: string[],
}