import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { DtoStatus } from "@/lib/types/DtoStatus"
import { LoadingOutlined } from "@ant-design/icons"
import { AntdIconProps } from "@ant-design/icons/lib/components/AntdIcon"
import {
   CheckSquareOffset,
   ExclamationMark,
   Hourglass,
   IconProps,
   ThumbsUp,
   Wrench,
   XCircle,
} from "@phosphor-icons/react"

export type FixRequestStatuses =
   | "pending"
   | "head_cancel"
   // | "checked"
   | "approved"
   | "rejected"
   | "in_progress"
   | "head_confirm"
   | "closed"
   | "hm_verify"

export function FixRequest_StatusData(
   key: FixRequestStatuses,
   iconProps?: {
      phosphor?: IconProps
      antD?: AntdIconProps
   },
): DtoStatus<FixRequestStatuses, FixRequestStatus, RequestDto> {
   switch (key) {
      case "pending": {
         return {
            index: 0,
            name: "pending",
            description: "Yêu cầu đã được tạo nhưng chưa được xử lý",
            text: "Chưa xử lý",
            colorInverse: "default",
            color: "default",
            conditionFn: (dto) => dto.status === FixRequestStatus.PENDING,
            icon: <Hourglass {...iconProps?.phosphor} />,
            statusEnum: FixRequestStatus.PENDING,
            className: "text-neutral-500",
         }
      }
      case "head_cancel": {
         return {
            index: 1,
            name: "head_cancel",
            description: "Yêu cầu đã bị hủy bởi trưởng phòng",
            text: "Hủy bởi trưởng phòng",
            colorInverse: "red-inverse",
            color: "red",
            conditionFn: (dto) => dto.status === FixRequestStatus.HEAD_CANCEL,
            icon: <XCircle {...iconProps?.phosphor} />,
            statusEnum: FixRequestStatus.HEAD_CANCEL,
            className: "text-red-500",
         }
      }
      case "approved": {
         return {
            index: 1,
            name: "approved",
            description: "Yêu cầu đã được phê duyệt",
            text: "Xác nhận",
            colorInverse: "green-inverse",
            color: "green",
            conditionFn: (dto) => dto.status === FixRequestStatus.APPROVED,
            icon: <ThumbsUp {...iconProps?.phosphor} />,
            statusEnum: FixRequestStatus.APPROVED,
            className: "text-green-500",
         }
      }
      case "rejected": {
         return {
            index: 1,
            name: "rejected",
            text: "Không tiếp nhận",
            description: "Yêu cầu đã bị từ chối",
            colorInverse: "red-inverse",
            color: "red",
            conditionFn: (dto) => dto.status === FixRequestStatus.REJECTED,
            icon: <XCircle {...iconProps?.phosphor} />,
            statusEnum: FixRequestStatus.REJECTED,
            className: "text-red-500",
         }
      }
      case "in_progress": {
         return {
            index: 2,
            name: "in_progress",
            text: "Đang thực hiện",
            description: "Yêu cầu đang được xử lý",
            colorInverse: "blue-inverse",
            color: "blue",
            conditionFn: (dto) => dto.status === FixRequestStatus.IN_PROGRESS,
            icon: <Wrench {...iconProps?.phosphor} />,
            statusEnum: FixRequestStatus.IN_PROGRESS,
            className: "text-blue-500",
         }
      }
      case "head_confirm": {
         return {
            index: 3,
            name: "head_confirm",
            text: "Chờ đánh giá",
            description: "Chờ bạn đánh giá quá trình kiểm tra",
            colorInverse: "gold-inverse",
            color: "gold",
            conditionFn: (dto) => dto.status === FixRequestStatus.HEAD_CONFIRM,
            icon: <ThumbsUp {...iconProps?.phosphor} />,
            statusEnum: FixRequestStatus.HEAD_CONFIRM,
            className: "text-yellow-800",
         }
      }
      case "closed": {
         return {
            index: 4,
            name: "closed",
            text: "Đóng",
            description: "Yêu cầu đã hoàn thành",
            colorInverse: "purple-inverse",
            color: "purple",
            conditionFn: (dto) => dto.status === FixRequestStatus.CLOSED,
            icon: <CheckSquareOffset {...iconProps?.phosphor} />,
            statusEnum: FixRequestStatus.CLOSED,
            className: "text-purple-500",
         }
      }
      case "hm_verify": {
         return {
            index: 5,
            name: "hm_verify",
            text: "Cần kiểm tra",
            description: "Yêu cầu cần được kiểm tra",
            colorInverse: "red-inverse",
            color: "red",
            conditionFn: (dto) => dto.status === FixRequestStatus.HM_VERIFY,
            icon: <ExclamationMark {...iconProps?.phosphor} />,
            statusEnum: FixRequestStatus.HM_VERIFY,
            className: "text-red-500",
         }
      }
   }
}

export function FixRequest_StatusMapper(dto?: RequestDto): DtoStatus<FixRequestStatuses, FixRequestStatus, RequestDto> {
   if (dto === undefined) {
      return {
         index: -1,
         name: "pending",
         description: "...",
         text: "Đang tải...",
         colorInverse: "default",
         color: "default",
         conditionFn: () => false,
         icon: <LoadingOutlined />,
         statusEnum: FixRequestStatus.PENDING,
      }
   }

   if (FixRequest_StatusData("pending").conditionFn(dto)) {
      return FixRequest_StatusData("pending")
   }

   if (FixRequest_StatusData("head_cancel").conditionFn(dto)) {
      return FixRequest_StatusData("head_cancel")
   }

   // if (FixRequest_StatusData("checked").conditionFn(dto)) {
   //    return FixRequest_StatusData("checked")
   // }

   if (FixRequest_StatusData("approved").conditionFn(dto)) {
      return FixRequest_StatusData("approved")
   }

   if (FixRequest_StatusData("rejected").conditionFn(dto)) {
      return FixRequest_StatusData("rejected")
   }

   if (FixRequest_StatusData("in_progress").conditionFn(dto)) {
      return FixRequest_StatusData("in_progress")
   }

   if (FixRequest_StatusData("head_confirm").conditionFn(dto)) {
      return FixRequest_StatusData("head_confirm")
   }

   if (FixRequest_StatusData("closed").conditionFn(dto)) {
      return FixRequest_StatusData("closed")
   }

   if (FixRequest_StatusData("hm_verify").conditionFn(dto)) {
      return FixRequest_StatusData("hm_verify")
   }

   throw new Error(`Unknown status ${dto.status}`)
}
