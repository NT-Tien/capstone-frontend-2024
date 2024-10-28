import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { SystemTypeErrorIds } from "@/lib/constants/Warranty"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"

class TaskUtil {
   /**
    * Returns
    * - undefined if task is null
    * - true if task is a fix task
    * - false if task is not a fix task
    * @param task
    */
   static isTask_Fix(task?: TaskDto): boolean | undefined {
      if (!task) return undefined
      return task.issues.every((i) => {
         return !SystemTypeErrorIds.has(i.typeError.id)
      })
   }

   static isTask_Warranty(task: TaskDto) {}

   static isTask_Renew(task: TaskDto) {}

   /**
    * Returns
    * - undefined if task is null
    * - true if task has spare parts
    * - false if task doesn't have spare parts
    * @param task
    */
   static hasSpareParts(task?: TaskDto): boolean | undefined {
      if (!task) return undefined

      return !!task.issues.find((i) => {
         return i.issueSpareParts.length > 0
      })
   }

   /**
    * Returns
    * - undefined if task is null
    * - null if task doesn't have spare parts
    * - true if task has spare parts and has been taken
    * - false if task has spare parts but hasn't been taken
    * @param task
    */
   static hasTakenSpareParts(task?: TaskDto): boolean | null | undefined {
      if (!task) return undefined
      if (!this.hasSpareParts(task)) return null

      return task.confirmReceipt ?? false
   }

   /**
    * Returns
    * - undefined if task is null
    * - null if task doesn't have spare parts and doesn't have failed issues
    * - true if task has spare parts and has been returned
    * - false if task has spare parts but hasn't been returned
    * @param task
    */
   static hasReturnedSpareParts(task?: TaskDto): boolean | undefined | null {
      if (!task) return undefined
      if (!this.hasSpareParts(task)) return null
      const failedIssues = task.issues.filter((i) => i.status === IssueStatusEnum.FAILED)
      if (failedIssues.length === 0) return null

      return failedIssues.every((i) => i.returnSparePartsStaffSignature && i.returnSparePartsStockkeeperSignature)
   }

   /**
    * Returns
    * - undefined if task is null
    * - true if task has failed issues
    * - false if task doesn't have failed issues
    * @param task
    */
   static hasUnreturnedFailedIssues(task?: TaskDto) {
      if (!task) return undefined
      return task.issues.some(
         (i) =>
            i.status === IssueStatusEnum.FAILED &&
            !i.returnSparePartsStockkeeperSignature &&
            !i.returnSparePartsStaffSignature,
      )
   }
}

export default TaskUtil
