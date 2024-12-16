import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { DeviceWarrantyCardStatus } from "@/lib/domain/DeviceWarrantyCard/DeviceWarrantyCardStatus.enum"
import { RequestDto } from "@/lib/domain/Request/Request.dto"

export type DeviceWarrantyCardDto = {
   code?: string
   status: DeviceWarrantyCardStatus
   device: DeviceDto
   request: RequestDto
   send_date?: Date
   receive_date?: Date
   wc_receiverName?: string
   wc_receiverPhone?: string
   initial_note?: string
   initial_images?: string[]
   initial_video?: string
   send_note?: string
   receive_note?: string
   wc_name?: string
   wc_address_1?: string
   wc_address_2?: string
   wc_address_ward?: string
   wc_address_district?: string
   wc_address_city?: string
   send_bill_image: string[]
   receive_bill_image: string[]
}
