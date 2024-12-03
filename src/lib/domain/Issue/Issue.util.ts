import {
   AssembleDeviceTypeErrorId,
   DisassembleDeviceTypeErrorId,
   DismantleOldDeviceTypeErrorId,
   DismantleReplacementDeviceTypeErrorId,
   InstallNewDeviceTypeErrorId,
   InstallReplacementDeviceTypeErrorId,
   ReceiveWarrantyTypeErrorId,
   SendWarrantyTypeErrorId,
   SystemTypeErrorIds,
} from "@/lib/constants/Warranty"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import IssueSparePartUtil from "@/lib/domain/IssueSparePart/IssueSparePart.util"

class IssueUtil {
   static isRenewIssue(issue?: IssueDto): undefined | boolean {
      if (!issue) return undefined

      return issue.typeError.id === DismantleOldDeviceTypeErrorId || issue.typeError.id === InstallNewDeviceTypeErrorId
   }

   static isWarrantyIssue(issue?: IssueDto): undefined | boolean {
      if (!issue) return undefined

      return (
         issue.typeError.id === ReceiveWarrantyTypeErrorId ||
         issue.typeError.id === SendWarrantyTypeErrorId ||
         issue.typeError.id === DisassembleDeviceTypeErrorId ||
         issue.typeError.id === AssembleDeviceTypeErrorId ||
         issue.typeError.id === InstallReplacementDeviceTypeErrorId ||
         issue.typeError.id === DismantleReplacementDeviceTypeErrorId
      )
   }
   static isFixIssue(issue?: IssueDto): undefined | boolean {
      if (!issue) return undefined
      if (!issue.typeError) throw new Error("IssueUtil.isFixIssue: issue.typeError is undefined")

      return !SystemTypeErrorIds.has(issue.typeError.id)
   }

   static hasOutOfStockIssueSpareParts(issue?: IssueDto): undefined | boolean {
      if (!issue) return undefined

      return issue.issueSpareParts.some((i) => IssueSparePartUtil.isOutOfStock(i))
   }

   static warranty_getNextIssue(issue?: IssueDto) {
      if (!issue) return undefined

      if (issue.typeError.id === DisassembleDeviceTypeErrorId) {
         return SendWarrantyTypeErrorId
      }

      if (issue.typeError.id === ReceiveWarrantyTypeErrorId) {
         return AssembleDeviceTypeErrorId
      }

      if (issue.typeError.id === SendWarrantyTypeErrorId) {
         return DisassembleDeviceTypeErrorId
      }

      if (issue.typeError.id === AssembleDeviceTypeErrorId) {
         return ReceiveWarrantyTypeErrorId
      }
   }
}

export default IssueUtil
