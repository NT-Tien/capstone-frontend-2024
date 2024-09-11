import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { useMemo, useState } from "react"
import { App, Button, Card, Checkbox, List, QRCode, Tag, Tooltip, Typography } from "antd"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Staff_Task_ReceiveSpareParts from "@/app/staff/_api/task/receive-spare-parts.api"
import staff_qk from "@/app/staff/_api/qk"
import { cn } from "@/common/util/cn.util"
import { CheckCard } from "@ant-design/pro-card"
import { GeneralProps } from "./page"

type Step1Props = GeneralProps & {
   data: FixRequestIssueDto[]
   id: string
   confirmReceipt: boolean
}

export default function Step0(props: Step1Props) {
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
         <Card className="mt-layout">Please head to the warehouse and show the QR code to the stock keeper.</Card>
         <QRCode value={props.id} className="mx-auto my-6" size={300} status="active"></QRCode>
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
         <div className="fixed bottom-0 left-0 flex w-full items-center justify-between gap-4 bg-white p-layout">
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
         </div>
      </div>
   )
}
