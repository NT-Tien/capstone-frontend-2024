import { SparePartDto } from "@/common/dto/SparePart.dto"
import { TypeErrorDto } from "@/common/dto/TypeError.dto"

export type MachineModelDto = {
   name: string
   description: string
   manufacturer: string
   yearOfProduction: number
   dateOfReceipt: string
   warrantyTerm: string
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: null | string
   spareParts: SparePartDto[]
   typeErrors: TypeErrorDto[]
}
