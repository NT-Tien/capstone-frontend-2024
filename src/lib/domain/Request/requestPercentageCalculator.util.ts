import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"

export function requestPercentageCalculator(request: RequestDto) {
   let percent = 0

   let finishedIssuesCount = 0
   request.issues.forEach((issue) => {
      if (issue.status === IssueStatusEnum.RESOLVED) {
         finishedIssuesCount++
      }
   })
   const totalIssues = request.issues.length

   percent = Math.round((finishedIssuesCount / totalIssues) * 100)

   return percent
}
