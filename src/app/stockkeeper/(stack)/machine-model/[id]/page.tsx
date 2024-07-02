"use client"

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
import Stockkeeper_MachineModel_GetById from "@/app/stockkeeper/_api/machine-model/getById.api"
import Stockkeeper_SparePart_GetById from "@/app/stockkeeper/_api/spare-part/getById.api"
import { useQuery } from "@tanstack/react-query"

export default function MachineModelDetails({ params }: { params: { id: string } }) {
   const result = useQuery({
      queryKey: qk.machineModels.one_byId(params.id),
      queryFn: () => Stockkeeper_MachineModel_GetById({ id: params.id }),
   })
   const spare_parts = useQuery({
    queryKey: qk.spareParts.one_byId(result.data?.id ?? ""),
    queryFn: () => Stockkeeper_SparePart_GetById({ id: result.data?.id ?? "" }),
    enabled: result.isSuccess
   })
   const router = useRouter()
   const { message } = App.useApp()
   const { t } = useTranslation()
   const { getFixTypeTranslation } = useIssueRequestStatusTranslation()

   return (
      <div
         style={{
            display: "grid",
            gridTemplateColumns: "[outer-start] 16px [inner-start] 1fr [inner-end] 16px [outer-end] 0",
         }}
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
                key: "description",
                label: t('TaskName'),
                dataIndex: "description",
             },
             {
                key: "manufacturer",
                label: t('TaskName'),
                dataIndex: "manufacturer",
             },
             {
                key: "yearOfProduction",
                label: t('TaskName'),
                dataIndex: "yearOfProduction",
             },
               {
                  key: "dateOfReceipt",
                  label: t('Created'),
                  dataIndex: "dateOfReceipt",
                  render: (_, e) => dayjs(e.dateOfReceipt).format("DD/MM/YYYY - HH:mm"),
               },
               {
                key: "warrantyTerm",
                label: t('Created'),
                dataIndex: "warrantyTerm",
                render: (_, e) => dayjs(e.warrantyTerm).format("DD/MM/YYYY - HH:mm"),
             },
            //    {
            //       key: "status",
            //       label: t('Status'),
            //       dataIndex: "status",
            //    },
            //    {
            //       key: "totalTime",
            //       label: t('TotalTime'),
            //       dataIndex: "totalTime",
            //    },
            //    {
            //       key: "operator",
            //       label: t('operator'),
            //       dataIndex: "operator",
            //    },
            ]}
         />
         <Card size="small" className="mt-4" title={t('DeviceDetails')}>
               <ProDescriptions
                  // bordered={true}
                  dataSource={spare_parts.data}
                  loading={spare_parts.isLoading}
                  size="small"
                  columns={[
                     {
                        key: "id",
                        title: t('DeviceId'),
                        dataIndex: "id",
                        render: (_, e) => {
                           if (!e.id) return "-"
                           const parts = e.id.split("-")
                           return parts[0] + "..." + parts[parts.length - 1]
                        },
                        copyable: true,
                     },
                     {
                        key: "name",
                        title: t('MachineModel'),
                        render: (_, e) => e.name ?? "-",
                     },
                     {
                        key: "device-machine-model",
                        title: t('MachineModel'),
                        render: (_, e) => e.machineModel?.name ?? "-",
                     },
                     {
                        key: "quantity",
                        title: t('MachineModel'),
                        render: (_, e) => e.quantity ?? "-",
                     },
                     {
                        key: "manufacturer",
                        title: t('Manufacturer'),
                        render: (_, e) => e.machineModel?.manufacturer ?? "-",
                     },
                  ]}
               />
            </Card>
         {/* <Tabs
            className="mt-3"
            style={{
               gridColumn: "inner-start / inner-end",
            }}
            items={[
               {
                  key: "machine",
                  label: t('Device'),
                  children: (
                     <ProDescriptions
                        dataSource={result.data?.device}
                        loading={result.isLoading}
                        size="small"
                        columns={[
                           {
                              key: "machineModel",
                              label: t('MachineModel'),
                              render: (_, e) => e.machineModel?.name ?? "-",
                           },
                           {
                              key: "position",
                              label: t('Position'),
                              render: (_, e) => `${e.area?.name ?? "-"} - (${e.positionX} : ${e.positionY})`,
                           },
                           {
                              key: "description",
                              label: t('Description'),
                              dataIndex: "description",
                           },
                        ]}
                     />
                  ),
               },
               {
                  key: "issues",
                  label: t('Issues'),
                  children: (
                     <div>
                        <Collapse
                           expandIconPosition="end"
                           items={result.data?.issues.map((item: TaskIssueDto) => ({
                              key: item.id,
                              label: (
                                 <div>
                                    <Tag color={item.fixType === FixType.REPAIR ? "red" : "blue"}>{getFixTypeTranslation(item.fixType)}</Tag>
                                    <Typography.Text className="w-40">{item.typeError.name}</Typography.Text>
                                 </div>
                              ),
                              children: (
                                 <div>
                                    <Descriptions
                                       size="small"
                                       items={[
                                          {
                                             label: t('Description'),
                                             children: item.description,
                                          },
                                       ]}
                                    />
                                    <Descriptions
                                       size="small"
                                       layout="vertical"
                                       items={[
                                          {
                                             label: t('SpareParts'),
                                             span: 10,
                                             contentStyle: {
                                                width: "100%",
                                             },
                                             children: (
                                                <SelectSparePartDrawer
                                                   onFinish={(values) => {
                                                      mutate_addSparePart.mutate({
                                                         issue: item.id,
                                                         sparePart: values.sparePartId,
                                                         quantity: values.quantity,
                                                      })
                                                   }}
                                                >
                                                   {(handleOpen) => (
                                                      <div className="w-full">
                                                         <List
                                                            className={"w-full"}
                                                            dataSource={item.issueSpareParts}
                                                            itemLayout={"horizontal"}
                                                            renderItem={(sp) => (
                                                               <List.Item
                                                                  itemID={sp.id}
                                                                  key={sp.id}
                                                                  extra={
                                                                     result.data?.status ===
                                                                        TaskStatus.AWAITING_FIXER && (
                                                                        <Button
                                                                           danger
                                                                           type="text"
                                                                           size={"small"}
                                                                           icon={<DeleteOutlined />}
                                                                           onClick={() => {
                                                                              mutate_deleteSparePart.mutate({
                                                                                 id: sp.id,
                                                                              })
                                                                           }}
                                                                        />
                                                                     )
                                                                  }
                                                               >
                                                                  <List.Item.Meta
                                                                     title={sp.sparePart.name}
                                                                     description={`${t('Qty')}: ${sp.quantity}`}
                                                                  ></List.Item.Meta>
                                                               </List.Item>
                                                            )}
                                                         />
                                                         {result.data?.status === TaskStatus.AWAITING_FIXER && (
                                                            <Button
                                                               className="w-full"
                                                               type="dashed"
                                                               size="large"
                                                               onClick={() =>
                                                                  result.isSuccess &&
                                                                  handleOpen(
                                                                     result.data.device.id,
                                                                     result.data.issues
                                                                        .filter((t) => t.id === item.id)[0]
                                                                        ?.issueSpareParts.map((m) => m.sparePart.id),
                                                                  )
                                                               }
                                                            >
                                                               Add Spare Part
                                                            </Button>
                                                         )}
                                                      </div>
                                                   )}
                                                </SelectSparePartDrawer>
                                             ),
                                          },
                                       ]}
                                    />
                                 </div>
                              ),
                           }))}
                        />
                        {result.data?.status === TaskStatus.AWAITING_FIXER && (
                           <CreateIssueDrawer>
                              {(handleOpen) => (
                                 <Button
                                    type="dashed"
                                    className="my-3 h-14 w-full"
                                    onClick={() => handleOpen(params.id)}
                                 >
                                    Add Issue
                                 </Button>
                              )}
                           </CreateIssueDrawer>
                        )}
                     </div>
                  ),
               },
               {
                  key: "assign_fixer",
                  label: t('Fixer'),
                  children: (
                     <div>
                        {result.isSuccess && result.data.fixer !== null ? (
                           <Card
                              size="small"
                              classNames={{
                                 body: "flex",
                              }}
                           >
                              <Avatar icon={<UserOutlined />} />
                              <div className="ml-3">
                                 <div className="text-base font-semibold">{result.data.fixer.username}</div>
                                 <div className="text-xs">{result.data.fixer.phone}</div>
                              </div>
                           </Card>
                        ) : (
                           <>
                              <Card size="small">
                                 By assigning a fixer, this task will be automatically moved to <Tag>PENDING</Tag>status
                              </Card>
                              <AssignFixerDrawer
                                 onFinish={(fixerId) => {
                                    mutate_assignFixer.mutate({
                                       id: params.id,
                                       payload: {
                                          fixer: fixerId,
                                       },
                                    })
                                 }}
                              >
                                 {(handleOpen) => (
                                    <Button type="dashed" className="mt-3 w-full" onClick={handleOpen}>
                                       Add Fixer
                                    </Button>
                                 )}
                              </AssignFixerDrawer>
                           </>
                        )}
                     </div>
                  ),
               },
            ]}
         /> */}
      </div>
   )
}
