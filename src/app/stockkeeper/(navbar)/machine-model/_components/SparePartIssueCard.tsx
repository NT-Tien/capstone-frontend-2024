// "use client"

// import { Button, Card, Typography } from "antd"
// import { FixRequestDto } from "@/common/dto/IssueRequest.dto"
// import { CaretRightOutlined } from "@ant-design/icons"
// import { useRouter } from "next/navigation"
// import dayjs from "dayjs"
// import { Tag } from "antd-mobile"
// import { useIssueRequestStatusTranslation } from "@/common/enum/use-issue-request-status-translation"
// import { SparePartDto } from "@/common/dto/SparePart.dto"
// import { TaskDto } from "@/common/dto/Task.dto"
// import { TaskIssueDto } from "@/common/dto/TaskIssue.dto"
// import { FixRequestIssueSparePartDto } from "@/common/dto/IssueSparePart.dto"

// type Props = {
//    sparePartIssue: FixRequestIssueSparePartDto[]
// }

// export default function SparePartIssueCard(props: Props) {
//    const router = useRouter()
//    const { getStatusTranslation } = useIssueRequestStatusTranslation();

//    return (
//       <Card
//          className="bg-[#F3EDF7]"
//          bordered={true}
//          type="inner"
//          hoverable
//          size="small"
//       >
//          {/* <Typography.Text ellipsis={true}>{props.sparePartIssue.machineModel.name}</Typography.Text> */}
//          <div className="mt-3 flex items-center justify-between gap-3">
//             {/* <Tag color="default">{getStatusTranslation(props.issueRequest.status)}</Tag> */}
//             <Typography.Text className="mt-0 text-xs">
//                {/* {dayjs(props.issueRequest.createdAt).format("DD/MM/YYYY - HH:mm")} */}
//             </Typography.Text>
//          </div>
//       </Card>
//    )
// }
