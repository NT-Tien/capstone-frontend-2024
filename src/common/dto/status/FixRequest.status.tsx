import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { DtoStatus } from "@/common/types/DtoStatus"
import { CheckSquareOffset, Hourglass, IconProps, ThumbsUp, Wrench, XCircle } from "@phosphor-icons/react"
import { CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons"
import { AntdIconProps } from "@ant-design/icons/lib/components/AntdIcon"

export type FixRequestStatuses =
   | "pending"
   | "checked"
   | "approved"
   | "rejected"
   | "in_progress"
   | "head_confirm"
   | "closed"

export function FixRequest_StatusData(
   key: FixRequestStatuses,
   iconProps?: {
      phosphor?: IconProps
      antD?: AntdIconProps
   },
): DtoStatus<FixRequestStatuses, FixRequestStatus, FixRequestDto> {
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
         }
      }
      case "checked": {
         return {
            index: 1,
            name: "checked",
            description: "Yêu cầu đã được nhân viên kiểm tra",
            text: "Đã kiểm tra",
            colorInverse: "default",
            color: "default",
            conditionFn: (dto) => dto.status === FixRequestStatus.CHECKED,
            icon: <CheckCircleOutlined {...iconProps?.antD} />,
            statusEnum: FixRequestStatus.CHECKED,
         }
      }
      case "approved": {
         return {
            index: 2,
            name: "approved",
            description: "Yêu cầu đã được phê duyệt",
            text: "Xác nhận",
            colorInverse: "green-inverse",
            color: "green",
            conditionFn: (dto) => dto.status === FixRequestStatus.APPROVED,
            icon: <ThumbsUp {...iconProps?.phosphor} />,
            statusEnum: FixRequestStatus.APPROVED,
         }
      }
      case "rejected": {
         return {
            index: 2,
            name: "rejected",
            text: "Không tiếp nhận",
            description: "Yêu cầu đã bị từ chối",
            colorInverse: "red-inverse",
            color: "red",
            conditionFn: (dto) => dto.status === FixRequestStatus.REJECTED,
            icon: <XCircle {...iconProps?.phosphor} />,
            statusEnum: FixRequestStatus.REJECTED,
         }
      }
      case "in_progress": {
         return {
            index: 3,
            name: "in_progress",
            text: "Đang thực hiện",
            description: "Yêu cầu đang được xử lý",
            colorInverse: "blue-inverse",
            color: "blue",
            conditionFn: (dto) => dto.status === FixRequestStatus.IN_PROGRESS,
            icon: <Wrench {...iconProps?.phosphor} />,
            statusEnum: FixRequestStatus.IN_PROGRESS,
         }
      }
      case "head_confirm": {
         return {
            index: 4,
            name: "head_confirm",
            text: "Chờ đánh giá",
            description: "Chờ bạn xác nhận và đánh giá quá trình kiểm tra",
            colorInverse: "gold-inverse",
            color: "gold",
            conditionFn: (dto) => dto.status === FixRequestStatus.HEAD_CONFIRM,
            icon: <ThumbsUp {...iconProps?.phosphor} />,
            statusEnum: FixRequestStatus.HEAD_CONFIRM,
         }
      }
      case "closed": {
         return {
            index: 5,
            name: "closed",
            text: "Đóng",
            description: "Yêu cầu đã hoàn thành",
            colorInverse: "purple-inverse",
            color: "purple",
            conditionFn: (dto) => dto.status === FixRequestStatus.CLOSED,
            icon: <CheckSquareOffset {...iconProps?.phosphor} />,
            statusEnum: FixRequestStatus.CLOSED,
         }
      }
   }
}

export function FixRequest_StatusMapper(
   dto?: FixRequestDto,
): DtoStatus<FixRequestStatuses, FixRequestStatus, FixRequestDto> {
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

   if (FixRequest_StatusData("checked").conditionFn(dto)) {
      return FixRequest_StatusData("checked")
   }

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

   throw new Error(`Unknown status ${dto.status}`)
}
