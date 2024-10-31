import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import IssueSparePartUtil from "@/lib/domain/IssueSparePart/IssueSparePart.util"

class IssueUtil {
   static hasOutOfStockIssueSpareParts(issue?: IssueDto): undefined | boolean {
      if (!issue) return undefined

      return issue.issueSpareParts.some((i) => IssueSparePartUtil.isOutOfStock(i))
   }
}

export default IssueUtil
