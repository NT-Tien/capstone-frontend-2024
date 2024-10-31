import { IssueSparePartDto } from "@/lib/domain/IssueSparePart/IssueSparePart.dto"

class IssueSparePartUtil {
   static isOutOfStock(issueSparePart?: IssueSparePartDto): boolean | undefined {
      if (!issueSparePart) return undefined

      return issueSparePart.sparePart.quantity < issueSparePart.quantity
   }
}

export default IssueSparePartUtil
