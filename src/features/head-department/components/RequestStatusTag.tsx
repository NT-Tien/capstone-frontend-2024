import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import { Tag } from "antd"

type Props = {
   status?: FixRequestStatus
}

function RequestStatusTag(props: Props) {
   switch (props.status) {
      case FixRequestStatus.PENDING:
         return (
            <Tag className={"m-0"} color={"default"}>
               Chưa xử lý
            </Tag>
         )
      case FixRequestStatus.APPROVED:
      case FixRequestStatus.IN_PROGRESS:
         return (
            <Tag className={"m-0"} color={"blue"}>
               Đang sửa chữa
            </Tag>
         )
      case FixRequestStatus.HEAD_CONFIRM:
         return (
            <Tag className={"m-0"} color={"gold"}>
               Chờ đánh giá
            </Tag>
         )
      case FixRequestStatus.CLOSED:
         return (
            <Tag className={"m-0"} color={"purple"}>
               Đã đóng
            </Tag>
         )
      case FixRequestStatus.HEAD_CANCEL:
      case FixRequestStatus.REJECTED:
         return (
            <Tag className={"m-0"} color={"red"}>
               Từ chối
            </Tag>
         )
      default:
         return (
            <Tag className={"m-0"} color={"default"}>
               Chưa xử lý
            </Tag>
         )
   }
}

export default RequestStatusTag
