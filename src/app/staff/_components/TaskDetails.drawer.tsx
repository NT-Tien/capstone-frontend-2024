import { ReactNode, useState } from "react"
import { App, Button, Card, Collapse, Divider, Drawer, Tag } from "antd"
import { useMutation, useQuery } from "@tanstack/react-query"
import staff_qk from "@/app/staff/_api/qk"
import Staff_Task_OneById from "@/app/staff/_api/task/one-byId.api"
import { ProDescriptions } from "@ant-design/pro-components"
import dayjs from "dayjs"
import { ExclamationCircleOutlined, InfoCircleFilled, InfoCircleOutlined, InfoOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import Staff_Task_UpdateStart from "@/app/staff/_api/task/update-start.api"
import DeviceDetailsCard from "@/common/components/DeviceDetailsCard"

export default function TaskDetailsDrawer({
   children,
}: {
   children: (handleOpen: (taskId: string, shouldContinue?: boolean) => void) => ReactNode
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
         <Drawer open={open} onClose={handleClose} placement={"bottom"} height="max-content" title="Task Details">
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
            <DeviceDetailsCard device={task.data?.device} className="mt-2" />
            <Collapse
               className="mt-6"
               size="small"
               items={[
                  {
                     label: (
                        <div className="flex items-center gap-2">
                           <ExclamationCircleOutlined className="text-lg" />
                           Issues
                        </div>
                     ),
                     collapsible: "disabled",
                     headerClass: "text-black text-lg font-semibold",
                     showArrow: false,
                  },
                  ...(task.data?.issues.map((issue) => ({
                     key: issue.id + "_ISSUE",
                     label: issue.typeError.name,
                     children: (
                        <ProDescriptions
                           dataSource={issue}
                           size="small"
                           columns={[
                              {
                                 key: issue.id + "_ISSUE-1",
                                 label: "Description",
                                 dataIndex: "description",
                              },
                              {
                                 key: issue.id + "_ISSUE-2",
                                 label: "Fix Type",
                                 dataIndex: "fixType",
                              },
                           ]}
                        />
                     ),
                  })) ?? []),
               ]}
            />
            <Button className="mt-6 w-full" type="primary" size="large" onClick={handleStartTask}>
               {shouldContinue ? "Continue" : "Start"} Task
            </Button>
         </Drawer>
      </>
   )
}
