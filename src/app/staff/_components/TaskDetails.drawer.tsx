import React, { ReactNode, useState } from "react"
import { App, Button, Card, Collapse, Divider, Drawer, List, Select, Tag } from "antd"
import { useMutation, useQuery } from "@tanstack/react-query"
import staff_qk from "@/app/staff/_api/qk"
import Staff_Task_OneById from "@/app/staff/_api/task/one-byId.api"
import { ProDescriptions } from "@ant-design/pro-components"
import dayjs from "dayjs"
import { ExclamationCircleOutlined, InfoCircleFilled, InfoCircleOutlined, InfoOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import Staff_Task_UpdateStart from "@/app/staff/_api/task/update-start.api"
import DeviceDetailsCard from "@/common/components/DeviceDetailsCard"
import DataListView from "@/common/components/DataListView"
import api from "@/config/axios.config"
import { MapPin } from "@phosphor-icons/react"
import { FixTypeTagMapper } from "@/common/enum/fix-type.enum"

export default function TaskDetailsDrawer({
   children,
   showNextButton = true,
}: {
   children: (handleOpen: (taskId: string, shouldContinue?: boolean) => void) => ReactNode
   showNextButton?: boolean
}) {
   const [open, setOpen] = useState(false)
   const [taskId, setTaskId] = useState<string | undefined>(undefined)
   const [shouldContinue, setShouldContinue] = useState<boolean>(false)
   const router = useRouter()
   const { message } = App.useApp()

   const task = useQuery({
      queryKey: staff_qk.task.one_byId(taskId ?? ""),
      queryFn: () => Staff_Task_OneById({ id: taskId ?? "" }),
      enabled: !!taskId,
   })

   const mutate_startTask = useMutation({
      mutationFn: Staff_Task_UpdateStart,
      onMutate: async () => {
         message.open({
            type: "loading",
            content: `Loading...`,
            key: `loading`,
         })
      },
      onError: async (error) => {
         message.error({
            content: "An error occurred. Please try again later.",
         })
      },
      onSuccess: async () => {
         message.success({
            content: `Task started successfully.`,
         })
         await task.refetch()
      },
      onSettled: () => {
         message.destroy(`loading`)
      },
   })

   function handleStartTask() {
      if (!taskId) return
      if (shouldContinue) {
         router.push(`/staff/tasks/${taskId}/start`)
      } else {
         mutate_startTask.mutate(
            { id: taskId },
            {
               onSuccess: () => {
                  router.push(`/staff/tasks/${taskId}/start`)
               },
            },
         )
      }
   }

   function handleOpen(taskId: string, shouldContinue?: boolean) {
      setOpen(true)
      setTaskId(taskId)
      setShouldContinue(shouldContinue ?? false)
   }

   function handleClose() {
      setOpen(false)
      setTaskId(undefined)
      setShouldContinue(false)
   }

   return (
      <>
         {children(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            placement={"bottom"}
            height="100%"
            title="Task Details"
            classNames={{
               body: "overflow-auto",
            }}
         >
            <ProDescriptions
               column={1}
               loading={task.isLoading}
               title={task.data?.name}
               dataSource={task.data}
               size="small"
               extra={
                  <Tag color={task.data?.priority === true ? "red" : "default"}>
                     {task.data?.priority === true ? "Priority" : task.data?.priority === false ? "Normal" : "-"}
                  </Tag>
               }
               columns={[
                  {
                     key: "1",
                     label: "Created At",
                     render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
                  },
                  {
                     key: "2",
                     label: "Operator",
                     dataIndex: "operator",
                  },
                  {
                     key: "3",
                     label: "Total Time",
                     render: (_, e) => `${e.totalTime} minutes`,
                  },
               ]}
            />
            <section className="std-layout-outer rounded-lg bg-white py-layout">
               <h2 className="mb-2 text-base font-semibold">Device Details</h2>
               <DataListView
                  dataSource={task.data?.device}
                  bordered
                  itemClassName="py-2 px-0"
                  labelClassName="font-normal text-neutral-500 text-sub-base"
                  valueClassName="text-sub-base"
                  items={[
                     {
                        label: "Machine Model",
                        value: (s) => s.machineModel?.name,
                     },
                     {
                        label: "Area",
                        value: (s) => s.area?.name,
                     },
                     {
                        label: "Position (x, y)",
                        value: (s) => (
                           <a className="flex items-center gap-1">
                              {s.positionX} x {s.positionY}
                              <MapPin size={16} weight="fill" />
                           </a>
                        ),
                     },
                     {
                        label: "Manufacturer",
                        value: (s) => s.machineModel?.manufacturer,
                     },
                     {
                        label: "Year of Production",
                        value: (s) => s.machineModel?.yearOfProduction,
                     },
                     {
                        label: "Warranty Term",
                        value: (s) => s.machineModel?.warrantyTerm,
                     },
                     {
                        label: "Description",
                        value: (s) => s.description,
                     },
                  ]}
               />
            </section>
            <section className="std-layout-outer py-layout">
               <h2 className="mb-2 text-base font-semibold">Issues</h2>
               <List
                  dataSource={task.data?.issues}
                  renderItem={(item) => (
                     <List.Item>
                        <List.Item.Meta
                           title={item.typeError.name}
                           description={
                              <div className="flex items-center gap-1">
                                 <Tag color={FixTypeTagMapper[String(item.fixType)].colorInverse}>
                                    {FixTypeTagMapper[String(item.fixType)].text}
                                 </Tag>
                                 <span className="truncate">{item.description}</span>
                              </div>
                           }
                        />
                     </List.Item>
                  )}
               />
            </section>
            <section className="fixed bottom-0 left-0 w-full bg-white p-layout">
               {showNextButton && (
                  <Button className="mt-6 w-full" type="primary" size="large" onClick={handleStartTask}>
                     {shouldContinue ? "Continue" : "Start"} Task
                  </Button>
               )}
            </section>
         </Drawer>
      </>
   )
}
