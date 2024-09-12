import BasicSelectSparePartDrawer, {
   BasicSelectSparePartDrawerRefType,
} from "@/app/head-staff/mobile/(stack)/requests/[id]/BasicSelectSpareParts.drawer"
import { DeviceDto } from "@/common/dto/Device.dto"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { SparePartDto } from "@/common/dto/SparePart.dto"
import { TypeErrorDto } from "@/common/dto/TypeError.dto"
import { FixType, FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import useModalControls from "@/common/hooks/useModalControls"
import { cn } from "@/common/util/cn.util"
import AlertCard from "@/components/AlertCard"
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import { DotOutline, Info, Timer, Warning } from "@phosphor-icons/react"
import { Button, Divider, Drawer, DrawerProps, Form, Input, Radio, Select, Tag } from "antd"
import { forwardRef, ReactNode, useImperativeHandle, useMemo, useRef, useState } from "react"

type HandleOpen = {
   typeError: TypeErrorDto
   device: DeviceDto
   defaultIssue?: FixRequestIssueDto
}

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

export type CreateSingleIssueDrawerRefType = {
   handleOpen: (props: HandleOpen) => void
}

type Props = {
   drawerProps?: Omit<DrawerProps, "children">
   onFinish: (newIssue: FixRequestIssueDto) => void
   children?: (handleOpen: (props: HandleOpen) => void) => ReactNode
}

const CreateSingleIssueDrawer = forwardRef<CreateSingleIssueDrawerRefType, Props>(function Component(
   { children, ...props },
   ref,
) {
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (props: HandleOpen) => {
         setSelectedTypeError(props.typeError)
         setDevice(props.device)

         if (props.defaultIssue) {
            form.setFieldsValue({
               description: props.defaultIssue.description,
               fixType: props.defaultIssue.fixType,
            })
            setSelectedSpareParts(
               new Map(
                  props.defaultIssue.issueSpareParts.map((sp) => [
                     sp.sparePart.id,
                     {
                        sparePart: sp.sparePart,
                        quantity: sp.quantity,
                     },
                  ]),
               ),
            )
            setIsUpdate(true)
         }
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
   const [isUpdate, setIsUpdate] = useState(false)

   const basicSelectSparePartDrawerRef = useRef<BasicSelectSparePartDrawerRefType | null>(null)

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

   useImperativeHandle(ref, () => ({
      handleOpen,
   }))

   return (
      <>
         {children?.(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            title={isUpdate ? "Cập nhật lỗi" : "Tạo lỗi mới"}
            placement="right"
            width="100%"
            classNames={{
               header: "p-layout",
               body: "std-layout px-0 py-layout",
               footer: "p-layout",
            }}
            footer={
               <Button
                  key="submit"
                  className="w-full"
                  type="primary"
                  size="large"
                  htmlType="submit"
                  icon={<PlusOutlined />}
                  onClick={() => handleFinish(form.getFieldsValue())}
               >
                  {isUpdate ? "Cập nhật" : "Tạo lỗi mới"}
               </Button>
            }
            {...props.drawerProps}
         >
            <section className="grid grid-cols-2 gap-4">
               <div className="">
                  <h5 className="font-medium text-gray-500">Tên lỗi</h5>
                  <p className="mt-1 flex items-center gap-2">
                     <Warning size={16} weight="fill" />
                     {selectedTypeError?.name}
                  </p>
               </div>
               <div className="">
                  <h5 className="font-medium text-gray-500">Thời gian sửa chữa</h5>
                  <p className="mt-1 flex items-center gap-2">
                     <Timer size={16} weight="fill" />
                     {selectedTypeError?.duration} phút
                  </p>
               </div>
               <div className="col-span-2">
                  <h5 className="font-medium text-gray-500">Mô tả</h5>
                  <p className="mt-1 flex items-start gap-2">
                     <DotOutline size={24} weight="fill" />
                     {selectedTypeError?.description}
                  </p>
               </div>
            </section>

            <Divider className="std-layout-outer my-7" />

            <AlertCard
               text="Vui lòng điền các thông tin phía dưới để tạo một lỗi mới"
               type="info"
               icon={<Info size={20} weight="fill" />}
               className="mb-5"
            />

            <Form<FieldType> form={form} className="flex-grow" layout="vertical" requiredMark={false}>
               <Form.Item<FieldType>
                  label={<span className="font-medium text-gray-500">Cách sửa chữa</span>}
                  name="fixType"
                  initialValue={FixType.REPLACE}
                  className="w-full"
                  rules={[{ required: true }]}
               >
                  <Radio.Group buttonStyle="solid" size="middle" className="w-full">
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
               <Form.Item<FieldType>
                  label={<span className="font-medium text-gray-500">Mô tả lỗi</span>}
                  name="description"
                  rules={[{ required: true }]}
               >
                  <Input.TextArea
                     showCount={{
                        formatter: (props) => (
                           <span className="text-xs">
                              {props.count} / {props.maxLength}
                           </span>
                        ),
                     }}
                     maxLength={300}
                     rows={3}
                     placeholder="Ghi mô tả lỗi. Ví dụ: Máy không khởi động."
                  />
               </Form.Item>

               <div className="mb-5 grid h-5 place-items-center">
                  <Divider className="m-0"></Divider>
               </div>

               <Form.Item
                  label={
                     <div className="flex w-full justify-between gap-2">
                        <span className="font-medium text-gray-500">Linh kiện cần sử dụng</span>
                        <div className="w-max rounded-md border-[1px] border-neutral-100 bg-neutral-50 px-2 py-1 text-xs">
                           Đã chọn {selectedSpareParts.size}
                        </div>
                     </div>
                  }
                  className="mb-0"
               >
                  <Select
                     options={unselectedSpareParts.map((sparePart) => ({
                        label: (
                           <span className="flex justify-between">
                              {sparePart.name}
                              {sparePart.quantity <= 0 && (
                                 <Tag color="yellow" className="ml-2">
                                    Hết hàng
                                 </Tag>
                              )}
                           </span>
                        ),
                        value: sparePart.id,
                     }))}
                     className="w-full"
                     showSearch
                     size="large"
                     placeholder={<div className="text-sm">+ Chọn linh kiện</div>}
                     value={selectSparePartControl}
                     onChange={(sp) => {
                        setSelectSparePartControl(sp)
                        if (sp !== null && sp !== undefined && sp !== "") {
                           const sparePart = unselectedSpareParts.find((s) => s.id === sp)
                           !!sparePart && basicSelectSparePartDrawerRef.current?.handleOpen({ sparePart })
                        }
                     }}
                  />
               </Form.Item>
               <ul className="mt-4 space-y-2">
                  {Array.from(selectedSpareParts.values()).map((sp) => (
                     <li
                        key={sp.sparePart.id}
                        className={cn(
                           "flex items-center justify-between rounded-md bg-neutral-50 p-2",
                           sp.quantity > sp.sparePart.quantity && "border-[1px] border-yellow-100 bg-yellow-50",
                        )}
                     >
                        <div>
                           <h5 className="text-sm">{sp.sparePart.name}</h5>
                           <span className="text-sm text-neutral-500">x{sp.quantity}</span>
                        </div>
                        <div className="flex gap-2">
                           <Button
                              icon={<EditOutlined />}
                              type="text"
                              onClick={() => {
                                 basicSelectSparePartDrawerRef.current?.handleOpen({
                                    sparePart: sp.sparePart,
                                    defaultQuantity: sp.quantity,
                                    isUpdate: true,
                                 })
                              }}
                           ></Button>
                           <Button
                              icon={<DeleteOutlined />}
                              type="text"
                              danger
                              onClick={() => {
                                 setSelectedSpareParts((prev) => {
                                    prev.delete(sp.sparePart.id)
                                    return new Map(prev)
                                 })
                              }}
                           ></Button>
                        </div>
                     </li>
                  ))}
               </ul>
            </Form>
         </Drawer>
         <BasicSelectSparePartDrawer
            ref={basicSelectSparePartDrawerRef}
            afterClose={() => {
               setSelectSparePartControl(undefined)
            }}
            onOk={(sparePart, quantity) => {
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
         />
      </>
   )
})

export default CreateSingleIssueDrawer
