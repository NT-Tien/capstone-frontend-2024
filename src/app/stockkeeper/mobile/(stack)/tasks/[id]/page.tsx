"use client"

import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import RootHeader from "@/common/components/RootHeader"
import { DeleteOutlined, LeftOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import { ProDescriptions } from "@ant-design/pro-components"
import dayjs from "dayjs"
import { Button, Card, Collapse, List, Tag, Typography } from "antd"
import { useTranslation } from "react-i18next"
import Stockkeeper_Task_GetById from "../../../../_api/task/getById.api"
import React from "react"

export default function TaskDetails({ params }: { params: { id: string } }) {
   const result = useQuery({
      queryKey: qk.task.one_byId(params.id),
      queryFn: () => Stockkeeper_Task_GetById({ id: params.id }),
   })
   const router = useRouter()
   const { t } = useTranslation()

   return (
      <div className="std-layout">
         <RootHeader
            title={t('TaskDetails')}
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
            className="std-layout-outer p-4"
         />
         <ProDescriptions
            className="mt-layout"
            bordered={true}
            dataSource={result.data}
            loading={result.isLoading}
            size="small"
            columns={[
               {
                  key: "name",
                  label: t("TaskName"),
                  dataIndex: "name",
               },
               {
                  key: "created",
                  label: t("Created"),
                  dataIndex: "createdAt",
                  render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
               },
               {
                  key: "status",
                  label: t("Status"),
                  dataIndex: "status",
               },
               {
                  key: "priority",
                  label: t("Priority"),
                  render: (_, e) =>
                     e.priority ? <Tag color="red">{t("High")}</Tag> : <Tag color="green">{t("Low")}</Tag>,
               },
               {
                  key: "totalTime",
                  label: t("TotalTime"),
                  dataIndex: "totalTime",
               },
               {
                  key: "operator",
                  label: t("operator"),
                  dataIndex: "operator",
               },
            ]}
         />
         <Typography.Title level={5} className="mt-4">
            {t('SpareParts')}
         </Typography.Title>
         <List
            className={"w-full"}
            dataSource={result.data?.issues.flatMap((i) => i.issueSpareParts) ?? []}
            itemLayout={"horizontal"}
            size={"small"}
            renderItem={(sp) => (
               <List.Item itemID={sp.id} key={sp.id}>
                  <List.Item.Meta
                     title={<Typography.Text strong>{sp.sparePart.name}</Typography.Text>}
                     description={`${t("Qty")}: ${sp.quantity}`}
                  ></List.Item.Meta>
               </List.Item>
            )}
         />
         {/*<Collapse*/}
         {/*   ghost*/}
         {/*   size="middle"*/}
         {/*   bordered={false}*/}
         {/*   items={result.data?.issues.map((issue: any) => ({*/}
         {/*      key: issue.id,*/}
         {/*      label: issue.description,*/}
         {/*      children: (*/}
         {/*         <Card>*/}
         {/*            {issue.issueSpareParts.map((part: any) => (*/}
         {/*               <Card key={part.id} type="inner" title={part.sparePart.name}>*/}
         {/*                  <p>*/}
         {/*                     {t("Qty")}: {part.quantity}*/}
         {/*                  </p>*/}
         {/*                  <p>*/}
         {/*                     {t("Note")}: {part.note || "No note available"}*/}
         {/*                  </p>*/}
         {/*                  <p>*/}
         {/*                     {t("ExpirationDate")}: {dayjs(part.sparePart.expirationDate).format("DD/MM/YYYY")}*/}
         {/*                  </p>*/}
         {/*               </Card>*/}
         {/*            ))}*/}
         {/*         </Card>*/}
         {/*      ),*/}
         {/*   }))}*/}
         {/*/>*/}
      </div>
   )
}
