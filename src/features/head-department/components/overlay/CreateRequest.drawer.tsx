"use client"

import head_department_mutations from "@/features/head-department/mutations"
import hd_uris from "@/features/head-department/uri"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import RequestErrors from "@/lib/domain/Request/RequestErrors"
import { CloseOutlined, SendOutlined } from "@ant-design/icons"
import { Clipboard } from "@phosphor-icons/react"
import { Button, Drawer, DrawerProps, Input, Select } from "antd"
import Form from "antd/es/form"
import { useRouter } from "next/navigation"

type FieldType = {
   name: string
   description: string
}

type CreateRequestDrawerProps = {
   device?: DeviceDto
}
type Props = Omit<DrawerProps, "children"> & CreateRequestDrawerProps

function CreateRequestDrawer(props: Props) {
   const [form] = Form.useForm<FieldType>()
   const router = useRouter()
   const mutate_createRequest = head_department_mutations.request.createRequest({})
   const name = Form.useWatch("name", form)

   function handleSubmit(formData: FieldType, deviceId: string) {
      mutate_createRequest.mutate(
         {
            requester_note: formData.description ? `${formData.name}: ${formData.description}` : formData.name,
            device: deviceId,
         },
         {
            onSuccess: (result) => {
               setTimeout(() => {
                  router.push(hd_uris.stack.history_id(result.id))
               }, 300)
            },
         },
      )
   }

   return (
      <Drawer
         title={
            <div className="flex items-center">
               <h1 className="mr-auto flex items-center gap-2 text-lg font-semibold">
                  <Clipboard size={20} weight="fill" />
                  Tạo yêu cầu sửa chữa
               </h1>
               <Button type="text" icon={<CloseOutlined />} onClick={props.onClose} />
            </div>
         }
         placement="bottom"
         height="max-content"
         classNames={{
            footer: "p-layout",
            header: "border-none pb-0",
         }}
         closeIcon={false}
         footer={
            <Button
               block
               type="primary"
               onClick={form.submit}
               icon={<SendOutlined />}
               iconPosition="end"
               loading={mutate_createRequest.isPending}
               disabled={!props.device}
            >
               Gửi yêu cầu
            </Button>
         }
         {...props}
      >
         <Form<FieldType>
            form={form}
            layout="vertical"
            onFinish={(data) => props.device && handleSubmit(data, props.device.id)}
         >
            <section>
               <header className="mb-2">
                  <h2 className="text-base font-semibold">Phân loại vấn đề</h2>
                  <p className="font-base text-sm text-neutral-500">
                     Vui lòng chọn vấn đề của thiết bị trong danh sách sau
                  </p>
               </header>
               <Form.Item<FieldType> name="name" rules={[{ required: true }]}>
                  <Select
                     options={RequestErrors}
                     placeholder="Chọn vấn đề"
                     className={"placeholder:text-sm"}
                  />
               </Form.Item>
            </section>
            <section>
               <header className="mb-2">
                  <h2 className="text-base font-semibold">Mô tả vấn đề</h2>
                  <p className="font-base text-sm text-neutral-500">Hãy miêu tả chi tiết vấn đề của thiết bị</p>
               </header>
               <Form.Item<FieldType>
                  name="description"
                  rules={[
                     {
                        required: name === "create",
                     },
                  ]}
               >
                  <Input.TextArea
                     placeholder="Thiết bị phát ra tiếng kêu lạ khi hoạt động, bọc thiết bị lỏng, gây ra tiếng ồn"
                     maxLength={300}
                     showCount
                     minLength={50}
                     rows={3}
                  />
               </Form.Item>
            </section>
         </Form>
      </Drawer>
   )
}

export default CreateRequestDrawer
export type { CreateRequestDrawerProps }
