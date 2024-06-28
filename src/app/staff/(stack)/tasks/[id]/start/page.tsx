"use client"

import RootHeader from "@/common/components/RootHeader"
import { App, Button, Card, Checkbox, List, Spin, Tabs, Tag, Tooltip, Typography } from "antd"
import { CSSProperties, useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import staff_qk from "@/app/staff/_api/qk"
import Staff_Task_OneById from "@/app/staff/_api/task/one-byId.api"
import BottomBar from "@/common/components/BottomBar"
import { useRouter } from "next/navigation"
import { CheckCard } from "@ant-design/pro-card"
import { TaskIssueDto } from "@/common/dto/TaskIssue.dto"
import { cn } from "@/common/util/cn.util"
import Staff_Task_ReceiveSpareParts from "@/app/staff/_api/task/receive-spare-parts.api"
import { ProDescriptions } from "@ant-design/pro-components"
import dayjs from "dayjs"
import { TaskDto } from "@/common/dto/Task.dto"
import ProList from "@ant-design/pro-list/lib"
import { RightOutlined } from "@ant-design/icons"
import IssueDetailsDrawer from "@/app/staff/_components/IssueDetails.drawer"
import { IssueStatusEnum } from "@/common/enum/issue-status.enum"

export default function StartTask({ params }: { params: { id: string } }) {
   const [currentStep, setCurrentStep] = useState<number>(-1)
   const router = useRouter()

   const response = useQuery({
      queryKey: staff_qk.task.one_byId(params.id),
      queryFn: () => Staff_Task_OneById({ id: params.id }),
   })

   useEffect(() => {
      if (response.isSuccess) {
         if (response.data.confirmReceipt === true) {
            setCurrentStep(1)
            return
         }
         setCurrentStep(0)
      }
   }, [response.data, response.isSuccess])

   return (
      <div
         style={{
            display: "grid",
            gridTemplateColumns: "[outer-start] 16px [inner-start] 1fr [inner-end] 16px [outer-end]",
         }}
      >
         <RootHeader
            title="Start Task"
            className="p-4"
            style={{
               gridColumn: "outer-start / outer-end",
            }}
         />
         {currentStep === -1 && <Spin fullscreen={true} />}
         {currentStep === 0 && (
            <Step1
               data={response.data?.issues ?? []}
               id={params.id}
               handleBack={() => router.push("/staff/tasks")}
               handleNext={() => setCurrentStep((prev) => prev + 1)}
               className="mt-4"
               style={{
                  gridColumn: "inner-start / inner-end",
               }}
               confirmReceipt={response.data?.confirmReceipt ?? false}
            />
         )}
         {currentStep === 1 && (
            <Step2
               handleBack={() => setCurrentStep((prev) => prev - 1)}
               handleNext={() => setCurrentStep((prev) => prev + 1)}
               style={{
                  gridColumn: "inner-start / inner-end",
               }}
               data={response.data}
               loading={response.isLoading}
               id={params.id}
            />
         )}
         {currentStep === 2 && (
            <Step3
               style={{
                  gridColumn: "inner-start / inner-end",
               }}
            />
         )}
      </div>
   )
}

type GeneralProps = {
   style?: CSSProperties
   className?: string
   handleNext?: () => void
   handleBack?: () => void
}

type Step1Props = GeneralProps & {
   data: TaskIssueDto[]
   id: string
   confirmReceipt: boolean
}

function Step1(props: Step1Props) {
   const [currentChecked, setCurrentChecked] = useState<{ [key: string]: boolean }>({})
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   const mutate_acceptSpareParts = useMutation({
      mutationFn: Staff_Task_ReceiveSpareParts,
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
            content: `Spare parts received successfully.`,
         })
         await queryClient.invalidateQueries({
            queryKey: staff_qk.task.one_byId(props.id),
         })
      },
      onSettled: () => {
         message.destroy(`loading`)
      },
   })

   const totalSpareParts = useMemo(() => {
      return props.data.reduce((acc, issue) => {
         return acc + issue.issueSpareParts.length
      }, 0)
   }, [props.data])

   return (
      <div style={props.style} className={props.className}>
         <Card className="mt-1">Please head to the warehouse to collect the following spare parts.</Card>
         {props.data.map((issue, index) => (
            <List
               key={issue.id}
               dataSource={issue.issueSpareParts}
               grid={{
                  column: 1,
               }}
               size={"small"}
               itemLayout={"vertical"}
               className={cn("mt-3", index !== 0 && "mt-0")}
               header={
                  index === 0 && (
                     <div className="flex items-center justify-between">
                        <Typography.Title level={5} className="m-0">
                           Spare Parts ({totalSpareParts})
                        </Typography.Title>
                        <Button
                           type="link"
                           size="small"
                           onClick={() => {
                              if (Object.keys(currentChecked).length === totalSpareParts) {
                                 setCurrentChecked({})
                              } else {
                                 setCurrentChecked(
                                    props.data.reduce((acc, issue) => {
                                       issue.issueSpareParts.forEach((item) => {
                                          acc[item.id] = true
                                       })
                                       return acc
                                    }, {} as any),
                                 )
                              }
                           }}
                        >
                           {Object.keys(currentChecked).length === totalSpareParts ? "Unselect All" : "Select All"}
                        </Button>
                     </div>
                  )
               }
               split={false}
               renderItem={(item) => (
                  <CheckCard
                     key={item.id}
                     size="small"
                     className="h-max w-full"
                     bordered={true}
                     title={item.sparePart.name}
                     description={
                        <div className="flex flex-col">
                           <div>
                              <Typography.Text className="mr-2 text-sm text-gray-400">Error:</Typography.Text>
                              <Typography.Text className="text-sm">{issue.typeError.name}</Typography.Text>
                           </div>
                           <div>
                              <Typography.Text className="mr-2 text-sm text-gray-400">Note:</Typography.Text>
                              <Typography.Text className="text-sm">{item.note ?? "-"}</Typography.Text>
                           </div>
                        </div>
                     }
                     extra={
                        <div className="flex items-center">
                           <Tag color="blue">Qty: {item.quantity}</Tag>
                           <Checkbox checked={currentChecked[item.id] ?? false} />
                        </div>
                     }
                     checked={currentChecked[item.id] ?? false}
                     onChange={(checked) => {
                        if (checked) {
                           setCurrentChecked({ ...currentChecked, [item.id]: true })
                        } else {
                           const { [item.id]: _, ...rest } = currentChecked
                           setCurrentChecked(rest)
                        }
                     }}
                  />
               )}
            />
         ))}
         <BottomBar className="flex items-center justify-between gap-4">
            <Button size="large" onClick={props.handleBack} type="dashed">
               Back
            </Button>
            <Tooltip
               title={
                  Object.keys(currentChecked).length !== props.data.length ? "Please select all the spare parts" : ""
               }
            >
               <Button
                  size="large"
                  type="primary"
                  className="w-full"
                  disabled={Object.keys(currentChecked).length !== totalSpareParts}
                  onClick={() => {
                     if (!props.confirmReceipt) {
                        mutate_acceptSpareParts.mutate({
                           id: props.id,
                        })
                     }
                     props.handleNext?.() // TODO make this run on success only
                  }}
               >
                  Next
               </Button>
            </Tooltip>
         </BottomBar>
      </div>
   )
}

type Step2Props = GeneralProps & {
   data?: TaskDto
   loading: boolean
   id: string
}

function Step2(props: Step2Props) {
   const queryClient = useQueryClient()

   if (!props.data) {
      return <div style={props.style}>Loading...</div>
   }

   return (
      <>
         <Tabs
            style={{
               gridColumn: "outer-start / outer-end",
            }}
            tabBarStyle={{
               display: "flex",
               justifyContent: "space-between",
               background: "#fef7ff",
            }}
            items={[
               {
                  key: "1",
                  label: "Task Details",
                  children: (
                     <div className="px-4">
                        <ProDescriptions
                           column={1}
                           loading={props.loading}
                           title={props.data.name}
                           dataSource={props.data}
                           size="small"
                           extra={
                              <Tag color={props.data?.priority === true ? "red" : "default"}>
                                 {props.data?.priority === true
                                    ? "Priority"
                                    : props.data?.priority === false
                                      ? "Normal"
                                      : "-"}
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
                        <Card title={"Current Device"} size="small" className="mt-3">
                           <ProDescriptions
                              size="small"
                              dataSource={props.data?.device}
                              loading={props.loading}
                              columns={[
                                 {
                                    key: "device-3",
                                    label: "Machine Model",
                                    render: (_, e) => e.machineModel.name,
                                 },
                                 {
                                    key: "device-1",
                                    label: "Device Description",
                                    render: (_, e) => e.description,
                                 },
                                 {
                                    key: "device-2",
                                    label: "Area",
                                    render: (_, e) => `${e.area.name}`,
                                 },
                                 {
                                    key: "device-5",
                                    label: "Position",
                                    render: (_, e) => `${e.positionX}:${e.positionY}`,
                                 },
                                 {
                                    key: "device-4",
                                    label: "Manufacturer",
                                    render: (_, e) => e.machineModel.manufacturer,
                                 },
                              ]}
                           />
                        </Card>
                     </div>
                  ),
               },
               {
                  key: "2",
                  label: "Issues",
                  children: (
                     <div className="px-4 pt-1">
                        <IssueDetailsDrawer
                           afterSuccess={() => {
                              queryClient
                                 .invalidateQueries({
                                    queryKey: staff_qk.task.one_byId(props.id),
                                 })
                                 .then()
                           }}
                        >
                           {(handleOpen) => (
                              <List
                                 dataSource={props.data?.issues}
                                 split={false}
                                 renderItem={(item) => (
                                    <Card
                                       classNames={{
                                          body: "flex items-center",
                                       }}
                                       size="small"
                                       className={cn(
                                          "mb-2",
                                          item.status === IssueStatusEnum.RESOLVED && "bg-green-100 opacity-40",
                                          item.status === IssueStatusEnum.FAILED && "bg-red-100 opacity-40",
                                       )}
                                       hoverable
                                       onClick={() => handleOpen(item)}
                                    >
                                       <div className="flex-grow">
                                          <Typography.Title level={5} className="m-0 font-semibold">
                                             {item.typeError.name}
                                             <Tag className="ml-3">{item.fixType}</Tag>
                                          </Typography.Title>
                                          <Typography.Text ellipsis={true}>{item.description}</Typography.Text>
                                       </div>
                                       <Button icon={<RightOutlined />} type={"text"} size="large" />
                                    </Card>
                                 )}
                              />
                           )}
                        </IssueDetailsDrawer>
                     </div>
                  ),
               },
            ]}
         />
         <div style={props.style}>
            <BottomBar className="flex items-center justify-between gap-4">
               <Button size="large" onClick={props.handleBack} type="dashed">
                  Back
               </Button>
               <Button
                  size="large"
                  type="primary"
                  className="w-full"
                  disabled={!props.data.issues.every((issue) => issue.status !== IssueStatusEnum.PENDING)}
                  onClick={() => {
                     props.handleNext?.()
                  }}
               >
                  Next
               </Button>
            </BottomBar>
         </div>
      </>
   )
}

type Step3Props = GeneralProps & {}

function Step3(props: Step3Props) {
   return <div style={props.style}>Step 3</div>
}
