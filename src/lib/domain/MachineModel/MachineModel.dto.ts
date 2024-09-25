import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import { TypeErrorDto } from "@/lib/domain/TypeError/TypeError.dto"

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