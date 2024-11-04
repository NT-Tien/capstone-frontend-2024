import { IssueSparePartDto } from "@/lib/domain/IssueSparePart/IssueSparePart.dto"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"

class IssueSparePartUtil {
   static isOutOfStock(issueSparePart?: IssueSparePartDto): boolean | undefined {
      if (!issueSparePart) return undefined

      return issueSparePart.sparePart.quantity < issueSparePart.quantity
   }

   static mapToUniqueSpareParts(issueSpareParts?: IssueSparePartDto[]) {
      if (!issueSpareParts) return undefined

      const returnValue: {
         [sparePartId: string]: {
            sparePart: SparePartDto
            quantity: number
            issueSpareParts: IssueSparePartDto[]
         }
      } = {}

      issueSpareParts.forEach((issueSparePart) => {
         const sparePartId = issueSparePart.sparePart.id
         if (!returnValue[sparePartId]) {
            returnValue[sparePartId] = {
               sparePart: issueSparePart.sparePart,
               quantity: 0,
               issueSpareParts: [],
            }
         }

         returnValue[sparePartId].quantity += issueSparePart.quantity
         returnValue[sparePartId].issueSpareParts.push(issueSparePart)
      })

      return Object.values(returnValue)
   }
}

export default IssueSparePartUtil
