import { AssembleDeviceTypeErrorId, DisassembleDeviceTypeErrorId, ReceiveWarrantyTypeErrorId, SendWarrantyTypeErrorId } from "@/lib/constants/Warranty"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import IssueSparePartUtil from "@/lib/domain/IssueSparePart/IssueSparePart.util"

class IssueUtil {
   static hasOutOfStockIssueSpareParts(issue?: IssueDto): undefined | boolean {
      if (!issue) return undefined

      return issue.issueSpareParts.some((i) => IssueSparePartUtil.isOutOfStock(i))
   }

   static warranty_getNextIssue(issue?: IssueDto) {
      if (!issue) return undefined

      if(issue.typeError.id === DisassembleDeviceTypeErrorId) {
         return SendWarrantyTypeErrorId
      }

      if(issue.typeError.id === ReceiveWarrantyTypeErrorId) {
         return AssembleDeviceTypeErrorId
      }

      if(issue.typeError.id === SendWarrantyTypeErrorId) {
         return DisassembleDeviceTypeErrorId
      }

      if(issue.typeError.id === AssembleDeviceTypeErrorId) {
         return ReceiveWarrantyTypeErrorId
      }
   }
}

export default IssueUtil
