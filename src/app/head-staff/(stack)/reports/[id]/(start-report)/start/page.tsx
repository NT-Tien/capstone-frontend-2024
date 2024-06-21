"use client"

import { CloseOutlined, DeleteOutlined, LeftOutlined, PlusOutlined } from "@ant-design/icons"
import RootHeader from "@/common/components/RootHeader"
import { useRouter } from "next/navigation"
import { ProDescriptions, ProFormDigit, ProFormText } from "@ant-design/pro-components"
import dayjs from "dayjs"
import { Button, Card, Form, Input, Select, Switch, Tabs, Tag } from "antd"
import { useQuery } from "@tanstack/react-query"
import qk from "@/common/querykeys"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import HeadStaff_Device_OneById from "@/app/head-staff/_api/device/one-byId.api"
import SelectSparePartDrawer from "@/app/head-staff/(stack)/reports/[id]/(start-report)/_components/SelectSparePart.drawer"
import useStartContext from "@/app/head-staff/(stack)/reports/[id]/(start-report)/_hooks/useStartContext"
import { FixType } from "@/common/enum/fix-type.enum"

export default function StartReportPage({ params }: { params: { id: string } }) {
   const router = useRouter()
   const result = useQuery({
      queryKey: qk.issueRequests.byId(params.id),
      queryFn: () => HeadStaff_Request_OneById({ id: params.id }),
   })
   const { spareParts, setSpareParts } = useStartContext()
   const { form } = useStartContext()

   const device = useQuery({
      queryKey: qk.devices.one_byId(result.data?.device.id ?? ""),
      queryFn: () => HeadStaff_Device_OneById({ id: result.data?.device.id ?? "" }),
      enabled: result.isSuccess,
   })

   return (
      <div
         className="grid pb-24"
         style={{
            gridTemplateColumns: "[outer-start] 16px [inner-start] 1fr [inner-end] 16px [outer-end] 0",
         }}
      >
         <RootHeader
            title="Accept Report"
            icon={<LeftOutlined />}
            onIconClick={() => router.back()}
            style={{
               padding: "16px",
               gridColumn: "outer-start / outer-end",
            }}
         />
         <Tabs
            className="mt-3"
            style={{
               gridColumn: "inner-start / inner-end",
            }}
            type="card"
            items={[
               {
                  key: "device-details",
                  label: "Device Details",
                  children: (
                     <div
                        style={{
                           gridColumn: "inner-start / inner-end",
                        }}
                     >
                        <ProDescriptions
                           loading={result.isLoading}
                           dataSource={result.data}
                           size="small"
                           columns={[
                              {
                                 key: "createdAt",
                                 title: "Reported Date",
                                 dataIndex: "createdAt",
                                 render: (_, e) => dayjs(e.createdAt).format("DD/MM/YYYY - HH:mm"),
                              },
                              {
                                 key: "status",
                                 title: "Status",
                                 dataIndex: "status",
                                 render: (_, e) => <Tag color="default">{e.status}</Tag>,
                              },
                              {
                                 key: "account-name",
                                 title: "Reported By",
                                 render: (_, e) => e.requester?.username ?? "-",
                              },
                           ]}
                        />
                        <ProDescriptions
                           loading={result.isLoading}
                           dataSource={result.data}
                           size="small"
                           layout="vertical"
                           columns={[
                              {
                                 key: "description",
                                 title: "Requester Note",
                                 render: (_, e) => e.requester_note,
                              },
                           ]}
                        />
                        <Card size="small" className="mt-4" title="Device Details">
                           <ProDescriptions
                              // bordered={true}
                              dataSource={device.data}
                              loading={device.isLoading}
                              size="small"
                              columns={[
                                 {
                                    key: "device-id",
                                    title: "Device ID",
                                    dataIndex: "id",
                                    render: (_, e) => {
                                       if (!e.id) return "-"
                                       const parts = e.id.split("-")
                                       return parts[0] + "..." + parts[parts.length - 1]
                                    },
                                    copyable: true,
                                 },
                                 {
                                    key: "device-description",
                                    title: "Device Description",
                                    render: (_, e) => e.description,
                                 },
                                 {
                                    key: "device-positioning",
                                    title: "Position",
                                    render: (_, e) => `${e.area?.name ?? "..."} - (${e.positionX} : ${e.positionY})`,
                                 },
                                 {
                                    key: "device-machine-model",
                                    title: "Machine Model",
                                    render: (_, e) => e.machineModel?.name ?? "-",
                                 },
                                 {
                                    key: "manufacturer",
                                    title: "Manufacturer",
                                    render: (_, e) => e.machineModel?.manufacturer ?? "-",
                                 },
                              ]}
                           />
                        </Card>
                     </div>
                  ),
               },
               {
                  key: "about_task",
                  label: "About Task",
                  children: (
                     <div>
                        <ProFormText
                           name="name"
                           rules={[{ required: true }]}
                           label={"Task Name"}
                           fieldProps={{ size: "large" }}
                        />
                        <ProFormDigit
                           name="operator"
                           label="Operator"
                           rules={[{ required: true }]}
                           fieldProps={{ size: "large" }}
                        />
                        <Form.Item name="priority" label="How important is this issue?">
                           <Switch checkedChildren="High Priority" unCheckedChildren="Low Priority" size="default" />
                        </Form.Item>
                     </div>
                  ),
               },
               {
                  key: "issues",
                  label: "Issues",
                  children: (
                     <>
                        <Form.List name="issues">
                           {(fields, { add, remove }) => (
                              <>
                                 <div className="mb-1">{fields.length} Issue(s) created.</div>
                                 <SelectSparePartDrawer>
                                    {(handleOpen) => (
                                       <div className="flex flex-col gap-3">
                                          {fields.map(({ key, name, ...rest }) => (
                                             <Card
                                                bordered
                                                key={key}
                                                size="small"
                                                title={`Issue #${key + 1}`}
                                                extra={
                                                   <Button
                                                      size="small"
                                                      type="text"
                                                      onClick={() => remove(name)}
                                                      icon={<CloseOutlined />}
                                                   />
                                                }
                                             >
                                                <Form.Item
                                                   name={[name, "description"]}
                                                   label="Description"
                                                   rules={[{ required: true }]}
                                                   {...rest}
                                                >
                                                   <Input.TextArea placeholder="Input issue description" />
                                                </Form.Item>
                                                <Form.Item
                                                   name={[name, "typeError"]}
                                                   label="Error Type"
                                                   rules={[{ required: true }]}
                                                >
                                                   <Select
                                                      placeholder="Select an error type"
                                                      options={device.data?.machineModel.typeErrors.map((e) => ({
                                                         label: e.name,
                                                         value: e.id,
                                                      }))}
                                                   />
                                                </Form.Item>
                                                <Form.Item
                                                   name={[name, "fixType"]}
                                                   label="Fix type"
                                                   rules={[{ required: true }]}
                                                >
                                                   <Select
                                                      placeholder="Select a Fix type"
                                                      options={Object.values(FixType).map((fix) => ({
                                                         label: fix,
                                                         value: fix,
                                                      }))}
                                                   />
                                                </Form.Item>

                                                <div className="grid grid-cols-2 gap-3">
                                                   {spareParts
                                                      .filter((part) => part.issue === key.toString())
                                                      .map((part) => (
                                                         <Card
                                                            key={part.issue + part.quantity + part.sparePart}
                                                            title={part.sparePart}
                                                            size="small"
                                                            extra={
                                                               <Button
                                                                  type="text"
                                                                  icon={<DeleteOutlined />}
                                                                  danger={true}
                                                                  onClick={() => {
                                                                     setSpareParts((prev) =>
                                                                        prev.filter(
                                                                           (p) =>
                                                                              p.sparePart !== part.sparePart &&
                                                                              p.issue !== part.issue &&
                                                                              p.quantity !== part.quantity,
                                                                        ),
                                                                     )
                                                                  }}
                                                               />
                                                            }
                                                         >
                                                            <div>Qty: {part.quantity}</div>
                                                         </Card>
                                                      ))}
                                                   <Button
                                                      onClick={() =>
                                                         device.isSuccess && handleOpen(device.data.id, key.toString())
                                                      }
                                                   >
                                                      Add Part
                                                   </Button>
                                                </div>
                                             </Card>
                                          ))}
                                          <Button
                                             type="dashed"
                                             onClick={add}
                                             className="h-28 w-full"
                                             icon={<PlusOutlined />}
                                          >
                                             Add Issue
                                          </Button>
                                       </div>
                                    )}
                                 </SelectSparePartDrawer>
                              </>
                           )}
                        </Form.List>
                     </>
                  ),
               },
            ]}
         />
         <div className="fixed bottom-0 left-0 w-full bg-white p-4">
            <Button className="w-full" type="primary" size="large" onClick={form.submit}>
               Confirm
            </Button>
         </div>
      </div>
   )
}
