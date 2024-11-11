import { TaskDto } from "@/lib/domain/Task/Task.dto"
import {
   AssembleDeviceTypeErrorId,
   DisassembleDeviceTypeErrorId,
   ReceiveWarrantyTypeErrorId,
   SendWarrantyTypeErrorId,
   SystemTypeErrorIds,
} from "@/lib/constants/Warranty"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { IssueSparePartDto } from "@/lib/domain/IssueSparePart/IssueSparePart.dto"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { TaskStatus } from "@/lib/domain/Task/TaskStatus.enum"
import { NewDeviceInstallation, RemoveOldDeviceTypeErrorId } from "@/lib/constants/Renew"

class TaskUtil {
   static isTask_Running(task?: TaskDto): boolean | undefined {
      if (!task) return undefined
      const set = new Set([
         TaskStatus.ASSIGNED,
         TaskStatus.IN_PROGRESS,
         TaskStatus.AWAITING_FIXER,
         TaskStatus.AWAITING_SPARE_SPART,
         TaskStatus.HEAD_STAFF_CONFIRM,
      ])
      return set.has(task.status)
   }

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

   static isTask_Warranty(task?: TaskDto, type?: "send" | "receive"): boolean | undefined {
      if (!task) return undefined

      if (type === undefined) {
         return !!task.issues.find(
            (i) =>
               i.typeError.id === SendWarrantyTypeErrorId ||
               i.typeError.id === DisassembleDeviceTypeErrorId ||
               i.typeError.id === ReceiveWarrantyTypeErrorId ||
               i.typeError.id === AssembleDeviceTypeErrorId,
         )
      }

      if (type === "send") {
         return !!task.issues.find(
            (i) => i.typeError.id === SendWarrantyTypeErrorId || i.typeError.id === DisassembleDeviceTypeErrorId,
         )
      }

      if (type === "receive") {
         return !!task.issues.find(
            (i) => i.typeError.id === ReceiveWarrantyTypeErrorId || i.typeError.id === AssembleDeviceTypeErrorId,
         )
      }

      return undefined
   }
   
   static getTask_Warranty_FirstIssue(task?: TaskDto): IssueDto | undefined {
      if (!task) return undefined

      return task.issues.find(
         (i) => i.typeError.id === DisassembleDeviceTypeErrorId || i.typeError.id === ReceiveWarrantyTypeErrorId,
      )
   }

   static getTask_Warranty_SecondIssue(task?: TaskDto): IssueDto | undefined {
      if (!task) return undefined

      return task.issues.find(
         (i) => i.typeError.id === AssembleDeviceTypeErrorId || i.typeError.id === SendWarrantyTypeErrorId,
      )
   }

   static isTask_Renew(task?: TaskDto, type?: "remove" | "install"): boolean | undefined {
      if (!task) return undefined

      if (type === undefined) {
         return !!task.issues.find(
            (i) => i.typeError.id === RemoveOldDeviceTypeErrorId || i.typeError.id === NewDeviceInstallation
         )
      }

      if (type === "remove") {
         return !!task.issues.find(
            (i) => i.typeError.id === RemoveOldDeviceTypeErrorId
         )
      }

      if (type === "install") {
         return !!task.issues.find(
            (i) => i.typeError.id === NewDeviceInstallation
         )
      }

      return undefined
   }

   static getTask_Renew_FirstIssue(task?: TaskDto): IssueDto | undefined {
      if (!task) return undefined

      return task.issues.find(
         (i) => i.typeError.id === RemoveOldDeviceTypeErrorId
      )
   }

   static getTask_Renew_SecondIssue(task?: TaskDto): IssueDto | undefined {
      if (!task) return undefined

      return task.issues.find(
         (i) => i.typeError.id === NewDeviceInstallation
      )
   }

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

   static getUniqueSpareParts(task?: TaskDto) {
      if (!task) return undefined

      const issueSpareParts = task.issues.flatMap((i) => i.issueSpareParts)
      const returnValue: {
         [key: string]: {
            issueSparePart: IssueSparePartDto[]
            quantity: number
         }
      } = {}

      issueSpareParts.forEach((i) => {
         if (!returnValue[i.sparePart.id]) {
            returnValue[i.sparePart.id] = {
               issueSparePart: [],
               quantity: 0,
            }
         }

         returnValue[i.sparePart.id].issueSparePart.push(i)
         returnValue[i.sparePart.id].quantity += i.quantity
      })

      return returnValue
   }
}

export default TaskUtil
