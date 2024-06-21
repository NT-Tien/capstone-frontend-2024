"use client"

import { Card, Typography } from "antd"
import { IssueRequestDto } from "@/common/dto/IssueRequest.dto"
import { Button } from "antd"
import { CaretRightOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"
import { Tag } from "antd-mobile"

type Props = {
   issueRequest: IssueRequestDto
}

export default function ReportCard(props: Props) {
   const router = useRouter()

   return (
      <Card
         title={props.issueRequest.device.description}
         className="bg-[#F3EDF7]"
         bordered={true}
         type="inner"
         hoverable
         extra={<Button icon={<CaretRightOutlined />} type="text" size="small" />}
         size="small"
         onClick={() => router.push(`/head-staff/reports/${props.issueRequest.id}`)}
      >
         <Typography.Text ellipsis={true}>{props.issueRequest.requester_note}</Typography.Text>
         <div className="mt-3 flex items-center justify-between gap-3">
            <Tag color="default">{props.issueRequest.status}</Tag>
            <Typography.Text className="mt-0 text-xs">
               {dayjs(props.issueRequest.createdAt).format("DD/MM/YYYY - HH:mm")}
            </Typography.Text>
         </div>
      </Card>
   )
}
