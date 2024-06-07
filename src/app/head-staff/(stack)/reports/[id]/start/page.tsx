"use client"

import HeadStaffRootHeader from "@/app/head-staff/_components/HeadStaffRootHeader"
import BottomBar from "@/common/components/BottomBar"
import { Button, Card, Form, FormInstance, Input, InputNumber, Spin, Switch } from "antd"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProDescriptions, ProFormDigit } from "@ant-design/pro-components"
import dayjs from "dayjs"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import { mockQuery } from "@/common/util/mock-query.util"
import { IssueRequestMock } from "@/lib/mock/issue-request.mock"
import { NotFoundError } from "@/common/error/not-found.error"
import { IssueRequestDto } from "@/common/dto/IssueRequest.dto"

type FieldType = {
   name: string
   priority: boolean
   total_time: number
   operator: number
   fixer_id: string
   request_id: string
}

export default function StartReport({ params }: { params: { id: string } }) {
   const [step, setStep] = useState(0)
   const router = useRouter()
   const [form] = Form.useForm<FieldType>()

   const result = useQuery({
      queryKey: qk.issueRequests.byId(params.id),
      queryFn: async () => {
         const result = await mockQuery(IssueRequestMock.find((req) => req.id === params.id))
         if (!result) throw new NotFoundError("Report not found")
         return result
      },
   })

   return (
      <Form<FieldType> form={form}>
         {result.isSuccess ? (
            <>
               {step === 0 && (
                  <IssueRecheck
                     back={() => router.push(`/head-staff/reports/${params.id}`)}
                     next={() => setStep(1)}
                     data={result.data}
                  />
               )}
               {step === 1 && <CreateIssue next={() => setStep(2)} back={() => setStep(0)} form={form} />}
            </>
         ) : (
            <>
               {result.isLoading && <Spin fullscreen />}
               {result.isError && (
                  <div>
                     <span>An error has occurred</span>
                     <Button onClick={() => result.refetch()}>Retry</Button>
                  </div>
               )}
            </>
         )}
      </Form>
   )
}

type IssueNotesProps = {
   next: () => void
   back: () => void
   data: IssueRequestDto
}

function IssueRecheck(props: IssueNotesProps) {
   return (
      <div>
         <HeadStaffRootHeader
            title="Recheck Issue"
            style={{
               padding: "16px",
            }}
         />
         <div className="p-4">
            <Card>Please head to the given device to recheck the issue and take notes of the issue.</Card>
            <ProDescriptions
               dataSource={props.data}
               className="mt-4"
               size="small"
               bordered={true}
               columns={[
                  {
                     key: "Issue",
                     title: "Issue",
                     dataIndex: "description",
                  },
                  {
                     key: "createdAt",
                     title: "Reported Date",
                     dataIndex: "createdAt",
                     render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
                  },
                  {
                     key: "account-name",
                     title: "Reported By",
                     render: (_, e) => e.account.username,
                  },
               ]}
            />
            <Card size="small" className="mt-4" title="Device Details">
               <ProDescriptions
                  // bordered={true}
                  dataSource={props.data.device}
                  size="small"
                  columns={[
                     {
                        key: "device-id",
                        title: "Device ID",
                        dataIndex: "id",
                        render: (_, e) => {
                           const parts = e.id.split("-")
                           return parts[0] + "..." + parts[parts.length - 1]
                        },
                        copyable: true,
                     },
                     {
                        key: "device-name",
                        title: "Device Machine Model",
                        render: (_, e) => e.machineModel.name,
                     },
                     {
                        key: "device-production-date",
                        title: "Production Date",
                        render: (_, e) => dayjs(e.machineModel.dateOfReceipt).format("DD/MM/YYYY"),
                     },
                     {
                        key: "device-warranty-date",
                        title: "Warranty Date",
                        render: (_, e) => dayjs(e.machineModel.warrantyTerm).format("DD/MM/YYYY"),
                     },
                     {
                        key: "device-manufacturer",
                        title: "Manufacturer",
                        render: (_, e) => e.machineModel.manufacturer,
                     },
                     {
                        key: "device-positioning",
                        title: "Position",
                        render: (_, e) =>
                           `${e.position.area.name} - (${e.position.positionX}, ${e.position.positionY})`,
                     },
                  ]}
               />
            </Card>
         </div>

         <BottomBar className="flex items-center justify-between">
            <Button onClick={props.back}>Cancel</Button>
            <Button onClick={props.next}>Next</Button>
         </BottomBar>
      </div>
   )
}

type CreateIssueProps = {
   next: () => void
   back: () => void
   form: FormInstance<FieldType>
}

function CreateIssue(props: CreateIssueProps) {
   return (
      <div>
         <HeadStaffRootHeader
            title="Create Issue"
            style={{
               padding: "14px",
            }}
         />
         <div className="p-4">
            <Form.Item<FieldType> name="name" label="Name of Issue" rules={[{ required: true }]}>
               <Input placeholder="Add a name to your issue" />
            </Form.Item>
            <ProFormDigit name="total_time" label="Total Time" rules={[{ required: true }]} addonAfter="Minutes" />
            <Form.Item<FieldType> name="priority" label="Priority">
               <Switch />
            </Form.Item>
         </div>
         <BottomBar className="flex items-center justify-between">
            <Button onClick={props.back}>Back</Button>
            <Button onClick={props.next}>Next</Button>
         </BottomBar>
      </div>
   )
}

type AddSparePartsProps = {
   next: () => void
   back: () => void
   form: FormInstance<FieldType>
}

function AddSpareParts(props: AddSparePartsProps) {
   return (
      <div>
         <HeadStaffRootHeader
            title="Add Spare Parts"
            style={{
               padding: "14px",
            }}
         />
         <div className="p-4"></div>
         <BottomBar className="flex items-center justify-between">
            <Button onClick={props.back}>Back</Button>
            <Button onClick={props.next}>Next</Button>
         </BottomBar>
      </div>
   )
}
