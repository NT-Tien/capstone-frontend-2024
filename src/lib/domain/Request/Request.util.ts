import { SystemTypeErrorIds } from "@/lib/constants/Warranty"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { RequestDto } from "@/lib/domain/Request/Request.dto"

class RequestUtil {
   static hasFixIssues(request?: RequestDto): boolean | undefined {
      if (!request) return undefined

      return request.issues.some((i) => !SystemTypeErrorIds.has(i.typeError.id))
   }

   static hasFinishedAllFixIssues(request?: RequestDto): boolean | undefined {
      if (!request) return undefined

      return request.issues
         .filter((i) => !SystemTypeErrorIds.has(i.typeError.id))
         .every((i) => {
            return i.status === IssueStatusEnum.RESOLVED || i.status === IssueStatusEnum.CANCELLED
         })
   }

   static getCurrentWarrantyCard(request?: RequestDto) {
      if (!request) return undefined

      const deviceWarrantyCards = request.deviceWarrantyCards
      deviceWarrantyCards?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      return deviceWarrantyCards?.[0]
   }
}

export default RequestUtil
