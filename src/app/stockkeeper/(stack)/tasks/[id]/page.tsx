"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import HeadStaff_Task_OneById from "@/app/head-staff/_api/task/one-byId.api"
import RootHeader from "@/common/components/RootHeader"
import { DeleteOutlined, LeftOutlined, UserOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import { ProDescriptions } from "@ant-design/pro-components"
import dayjs from "dayjs"
import { App, Avatar, Button, Card, Collapse, Descriptions, List, Tabs, Tag, Typography } from "antd"
import { FixType } from "@/common/enum/fix-type.enum"
import SelectSparePartDrawer from "@/app/head-staff/(stack)/tasks/[id]/_components/SelectSparePart.drawer"
import HeadStaff_SparePart_Create from "@/app/head-staff/_api/spare-part/create.api"
import HeadStaff_SparePart_Delete from "@/app/head-staff/_api/spare-part/delete.api"
import AssignFixerDrawer from "@/app/head-staff/(stack)/tasks/[id]/_components/AssignFixer.drawer"
import HeadStaff_Task_UpdateAssignFixer from "@/app/head-staff/_api/task/update-assignFixer.api"
import { TaskStatus } from "@/common/enum/task-status.enum"
import CreateIssueDrawer from "@/app/head-staff/(stack)/tasks/[id]/_components/CreateIssue.drawer"
import { useTranslation } from "react-i18next"
import { useIssueRequestStatusTranslation } from "@/common/enum/use-issue-request-status-translation"
import { TaskIssueDto } from "@/common/dto/TaskIssue.dto"
import Stockkeeper_Task_GetById from "../../../_api/task/getById.api"


export default function TaskDetails({ params }: { params: { id: string } }) {
   const result = useQuery({
      queryKey: qk.task.one_byId(params.id),
      queryFn: () => Stockkeeper_Task_GetById({ id: params.id }),
   })
   const router = useRouter()
   const { message } = App.useApp()
   const { t } = useTranslation()
   const { getFixTypeTranslation } = useIssueRequestStatusTranslation()


   return (
      <div
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
         <RootHeader
            title="Task Details"
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
            className="p-4"
            style={{
               gridColumn: "outer-start / outer-end",
            }}
         />
         <ProDescriptions
            className="mt-3"
            bordered={true}
            style={{
               gridColumn: "inner-start / inner-end",
            }}
            dataSource={result.data}
            loading={result.isLoading}
            size="small"
            columns={[
               {
                  key: "name",
                  label: t('TaskName'),
                  dataIndex: "name",
               },
               {
                  key: "created",
                  label: t('Created'),
                  dataIndex: "createdAt",
                  render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
               },
               {
                  key: "status",
                  label: t('Status'),
                  dataIndex: "status",
               },
               {
                  key: "priority",
                  label: t('Priority'),
                  render: (_, e) => (e.priority ? <Tag color="red">{t('High')}</Tag> : <Tag color="green">{t('Low')}</Tag>),
               },
               {
                  key: "totalTime",
                  label: t('TotalTime'),
                  dataIndex: "totalTime",
               },
               {
                  key: "operator",
                  label: t('operator'),
                  dataIndex: "operator",
               },
            ]}
         />
                   <Collapse
            ghost
            size="middle"
            bordered={false}
            items={result.data?.issues.map((issue: any) => ({
               key: issue.id,
               label: issue.description,
               children: (
                  <Card>
                     {issue.issueSpareParts.map((part: any) => (
                        <Card
                           key={part.id}
                           type="inner"
                           title={part.sparePart.name}
                        >
                           <p>{t('Qty')}: {part.quantity}</p>
                           <p>{t('Note')}: {part.note || 'No note available'}</p>
                           <p>{t('ExpirationDate')}: {dayjs(part.sparePart.expirationDate).format('DD/MM/YYYY')}</p>
                        </Card>
                     ))}
                  </Card>
               )
            }))}
         />
         </div>
   )
}
