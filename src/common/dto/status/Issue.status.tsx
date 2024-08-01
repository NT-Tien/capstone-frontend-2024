import { Hourglass, IconProps, XCircle } from "@phosphor-icons/react"
import { AntdIconProps } from "@ant-design/icons/lib/components/AntdIcon"
import { DtoStatus } from "@/common/types/DtoStatus"
import { CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons"
import { IssueStatusEnum } from "@/common/enum/issue-status.enum"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"

export type IssueStatuses = "PENDING" | "FAILED" | "RESOLVED"

export function Issue_StatusData(
   key: IssueStatuses,
   iconProps?: {
      phosphor?: IconProps
      antD?: AntdIconProps
   },
): DtoStatus<IssueStatuses, IssueStatusEnum, FixRequestIssueDto> {
   switch (key) {
      case "PENDING": {
         return {
            index: 0,
            name: "PENDING",
            description: "Chưa xử lý",
            text: "Chưa xử lý",
            colorInverse: "default",
            color: "default",
            conditionFn: (dto) => dto.status === IssueStatusEnum.PENDING,
            icon: <Hourglass {...iconProps?.phosphor} />,
            statusEnum: IssueStatusEnum.PENDING,
         }
      }
      case "FAILED": {
         return {
            index: 1,
            name: "FAILED",
            description: "Thất bại",
            text: "Thất bại",
            colorInverse: "red-inverse",
            color: "red",
            conditionFn: (dto) => dto.status === IssueStatusEnum.FAILED,
            icon: <XCircle {...iconProps?.phosphor} />,
            statusEnum: IssueStatusEnum.FAILED,
         }
      }
      case "RESOLVED": {
         return {
            index: 2,
            name: "RESOLVED",
            description: "Thành công",
            text: "Thành công",
            colorInverse: "green-inverse",
            color: "green",
            conditionFn: (dto) => dto.status === IssueStatusEnum.RESOLVED,
            icon: <CheckCircleOutlined {...iconProps?.antD} />,
            statusEnum: IssueStatusEnum.RESOLVED,
         }
      }
      default: {
         throw new Error(`Unknown status ${key}`)
      }
   }
}

export function Issue_StatusMapper(
   dto?: FixRequestIssueDto,
): DtoStatus<IssueStatuses, IssueStatusEnum, FixRequestIssueDto> {
   if (dto === undefined) {
      return {
         index: -1,
         name: "PENDING",
         description: "...",
         text: "Đang tải...",
         colorInverse: "default",
         color: "default",
         conditionFn: () => false,
         icon: <LoadingOutlined />,
         statusEnum: IssueStatusEnum.PENDING,
      }
   }

   if (Issue_StatusData("PENDING").conditionFn(dto)) {
      return Issue_StatusData("PENDING")
   }

   if (Issue_StatusData("FAILED").conditionFn(dto)) {
      return Issue_StatusData("FAILED")
   }

   if (Issue_StatusData("RESOLVED").conditionFn(dto)) {
      return Issue_StatusData("RESOLVED")
   }

   throw new Error(`Unknown status ${dto.status}`)
}
