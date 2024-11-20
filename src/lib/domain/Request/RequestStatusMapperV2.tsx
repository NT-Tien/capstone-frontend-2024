import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"

function RequestStatus_Mapper(status?: FixRequestStatus) {
   if (!status) return undefined
   switch (status) {
      case FixRequestStatus.PENDING:
         return {
            className: "text-neutral-700",
            text: "Chưa xử lý",
         }
      case FixRequestStatus.HEAD_CANCEL:
         return {
            className: "text-emerald-500",
            text: "Hủy bởi trưởng phòng",
         }
      case FixRequestStatus.APPROVED:
         return {
            className: "text-green-500",
            text: "Đã Xác nhận",
         }
      case FixRequestStatus.REJECTED:
         return {
            className: "text-red-500",
            text: "Không tiếp nhận",
         }
      case FixRequestStatus.IN_PROGRESS:
         return {
            className: "text-blue-500",
            text: "Đang thực hiện",
         }
      case FixRequestStatus.CLOSED:
         return {
            className: "text-green-500",
            text: "Đã Đóng",
         }
      case FixRequestStatus.HEAD_CONFIRM:
         return {
            className: "text-orange-500",
            text: "Chờ xác nhận",
         }
   }
}

export default RequestStatus_Mapper
