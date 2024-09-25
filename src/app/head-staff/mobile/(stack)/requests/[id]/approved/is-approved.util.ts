import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"

export default function isApproved(status: FixRequestStatus) {
   const statuses = new Set([
      FixRequestStatus.APPROVED,
      FixRequestStatus.IN_PROGRESS,
      FixRequestStatus.HEAD_CONFIRM,
      FixRequestStatus.CLOSED,
   ])

   return statuses.has(status)
}
