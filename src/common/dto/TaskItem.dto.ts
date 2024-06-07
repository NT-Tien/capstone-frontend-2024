import { FixType } from "@/common/enum/fix-type.enum"

export type TaskItemDto = {
   id: string
   createdAt: string
   updatedAt: string
   deletedAt: string | null
   description: string
   quantity: number
   fix_item_type: FixType
   sparePartId: string
   typeErrorId: string
}
