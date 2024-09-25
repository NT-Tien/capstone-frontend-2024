import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"

export function taskPercentageCalculator(task: TaskDto) {
   let percent = 0
   if (task.confirmReceipt) percent += 20

   const totalIssues = task.issues.length
   if (totalIssues !== 0) {
      const completedIssues = task.issues.filter((issue) => issue.status === IssueStatusEnum.RESOLVED).length

      percent += (completedIssues / totalIssues) * 80
   }

   return percent
}
