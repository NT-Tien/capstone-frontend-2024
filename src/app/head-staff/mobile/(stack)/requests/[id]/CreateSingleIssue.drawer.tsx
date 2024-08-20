import React, { ReactNode, useMemo, useState } from "react"
import useModalControls from "@/common/hooks/useModalControls"
import { Button, Drawer, Form, List, Radio, Select } from "antd"
import { FixType, FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import { ProDescriptions, ProFormTextArea } from "@ant-design/pro-components"
import BasicSelectSparePartModal from "@/app/head-staff/mobile/(stack)/requests/[id]/BasicSelectSpareParts.modal"
import { PlusOutlined } from "@ant-design/icons"
import { TypeErrorDto } from "@/common/dto/TypeError.dto"
import { SparePartDto } from "@/common/dto/SparePart.dto"
import { DeviceDto } from "@/common/dto/Device.dto"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"

type SparePartInputType = {
   sparePart: SparePartDto
   quantity: number
}

type FieldType = {
   request: string
   typeError: string
   description: string
   fixType: FixType
}

type Props = {
   onFinish: (newIssue: FixRequestIssueDto) => void
}

export default function CreateSingleIssueDrawer({
   children,
   ...props
}: {
   children: (handleOpen: (typeError: TypeErrorDto, device: DeviceDto) => void) => ReactNode
} & Props) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (typeError: TypeErrorDto, device: DeviceDto) => {
         setSelectedTypeError(typeError)
         setDevice(device)
      },
      onClose: () => {
         setSelectedTypeError(undefined)
         setDevice(undefined)
         setSelectedSpareParts(new Map())
         setSelectSparePartControl(undefined)
         form.resetFields()
      },
   })

   const [form] = Form.useForm<FieldType>()

   const [device, setDevice] = useState<DeviceDto | undefined>(undefined)
   const [selectedTypeError, setSelectedTypeError] = useState<TypeErrorDto | undefined>()
   const [selectSparePartControl, setSelectSparePartControl] = useState<undefined | string>(undefined)
   const [selectedSpareParts, setSelectedSpareParts] = useState<Map<string, SparePartInputType>>(new Map())

   const unselectedSpareParts = useMemo(() => {
      if (!device) return []

      const fullList = device.machineModel.spareParts

      return fullList.filter((sp) => !selectedSpareParts.has(sp.id))
   }, [device, selectedSpareParts])

   async function handleFinish(values: FieldType) {
      const valid = await form.validateFields()
      if (!valid) return

      const issue = {
         typeError: selectedTypeError,
         description: values.description,
         issueSpareParts: Array.from(selectedSpareParts.values()).map((sp) => ({
            quantity: sp.quantity,
            sparePart: sp.sparePart,
         })),
         fixType: values.fixType,
      } as FixRequestIssueDto

      props.onFinish(issue)

      setTimeout(() => {
         handleClose()
      }, 500)
   }

   return (
      <>
         {children(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            title="Tạo vấn đề"
            placement="bottom"
            height="100%"
            classNames={{
               body: "pb-20",
            }}
         >
            <ProDescriptions
               dataSource={selectedTypeError}
               size="small"
               className="mb-3"
               title={<span className="text-lg">Thông tin lỗi</span>}
               labelStyle={{
                  fontSize: "var(--font-sub-base)",
               }}
               contentStyle={{
                  fontSize: "var(--font-sub-base)",
               }}
               columns={[
                  {
                     title: "Tên lỗi",
                     dataIndex: ["name"],
                  },
                  {
                     title: "Thời gian sửa chữa",
                     dataIndex: ["duration"],
                     render: (_, e) => `${e.duration} phút`,
                  },
                  {
                     title: "Mô tả",
                     dataIndex: ["description"],
                  },
               ]}
            />
            <Form<FieldType> form={form} className="flex-grow" layout="vertical">
               <Form.Item<FieldType>
                  label={<span className="text-sub-base">Cách sửa</span>}
                  name="fixType"
                  initialValue={FixType.REPLACE}
                  className="w-full"
                  rules={[{ required: true }]}
               >
                  <Radio.Group buttonStyle="solid" size="large" className="w-full">
                     {Object.values(FixType).map((fix) => (
                        <Radio.Button key={fix} value={fix} className="w-1/2 capitalize">
                           <div className="flex items-center gap-2 text-center">
                              <div>{FixTypeTagMapper[String(fix)].icon}</div>
                              <div>{FixTypeTagMapper[String(fix)].text}</div>
                           </div>
                        </Radio.Button>
                     ))}
                  </Radio.Group>
               </Form.Item>
               <ProFormTextArea
                  name="description"
                  label="Mô tả"
                  formItemProps={{
                     className: "mb-10",
                  }}
                  rules={[{ required: true }]}
                  allowClear
                  fieldProps={{
                     showCount: true,
                     maxLength: 300,
                  }}
               />

               <Form.Item label="Linh kiện thay thế">
                  <BasicSelectSparePartModal
                     afterClose={() => {
                        setSelectSparePartControl(undefined)
                     }}
                     onOk={(sparePart, quantity) => {
                        console.log(quantity <= 0)
                        if (quantity <= 0) {
                           setSelectedSpareParts((prev) => {
                              prev.delete(sparePart.id)
                              return new Map(prev)
                           })
                           return
                        }

                        setSelectedSpareParts((prev) => {
                           prev.set(sparePart.id, {
                              sparePart,
                              quantity,
                           })

                           return new Map(prev)
                        })
                     }}
                  >
                     {(handleOpen) => (
                        <>
                           <Select
                              options={unselectedSpareParts.map((sparePart) => ({
                                 label: sparePart.name,
                                 value: sparePart.id,
                              }))}
                              className="w-full"
                              showSearch
                              size="large"
                              placeholder="+ Chọn linh kiện"
                              value={selectSparePartControl}
                              onChange={(sp) => {
                                 setSelectSparePartControl(sp)
                                 if (sp !== null && sp !== undefined && sp !== "") {
                                    const sparePart = unselectedSpareParts.find((s) => s.id === sp)
                                    !!sparePart && handleOpen(sparePart)
                                 }
                              }}
                           />
                           <List
                              dataSource={Array.from(selectedSpareParts.values())}
                              bordered
                              className={"mb-4 mt-5"}
                              renderItem={(item) => (
                                 <List.Item className="p-4">
                                    <List.Item.Meta
                                       title={
                                          <div className="flex justify-between gap-3">
                                             <h5 className="line-clamp-2 font-semibold">{item.sparePart.name}</h5>
                                             <div className="w-max flex-shrink-0">Chọn {item.quantity}</div>
                                          </div>
                                       }
                                       description={
                                          <a
                                             className="font-medium"
                                             onClick={() => handleOpen(item.sparePart, item.quantity, true)}
                                          >
                                             Sửa
                                          </a>
                                       }
                                    />
                                 </List.Item>
                              )}
                           />
                        </>
                     )}
                  </BasicSelectSparePartModal>
               </Form.Item>

               <Form.Item<FieldType> className="fixed bottom-0 left-0 mb-0 w-full bg-white p-layout shadow-fb">
                  <Button
                     className="w-full"
                     type="primary"
                     size="large"
                     htmlType="submit"
                     icon={<PlusOutlined />}
                     onClick={() => handleFinish(form.getFieldsValue())}
                  >
                     Tạo vấn đề
                  </Button>
               </Form.Item>
            </Form>
         </Drawer>
      </>
   )
}
