import { DatePicker, Drawer, DrawerProps } from "antd"
import { useMemo } from "react"
import Button from "antd/es/button"
import Form from "antd/es/form"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import Input from "antd/es/input"
import dayjs from "dayjs"

type FormFieldTypes = {
   name: string
   quantity: number
   expirationDate: string
}
type SparePart_UpsertDrawerProps = {
   sparePart?: SparePartDto
   machineModel?: string
}
type Props = Omit<DrawerProps, "children"> & SparePart_UpsertDrawerProps

function SparePart_UpsertDrawer(props: Props) {
   const [form] = Form.useForm<FormFieldTypes>()

   const isUpdating = useMemo(() => !!props.sparePart, [props.sparePart])

   function handleSubmit(formProps: FormFieldTypes) {}

   return (
      <Drawer
         title={isUpdating ? "Cập nhật linh kiện" : "Thêm linh kiện mới"}
         placement="right"
         footer={
            <div className="flex items-center gap-3">
               <Button onClick={() => form.resetFields()}>Hủy</Button>
               <Button block type={"primary"} onClick={() => form.submit()}>
                  {isUpdating ? "Cập nhật" : "Thêm mới"}
               </Button>
            </div>
         }
         {...props}
      >
         <Form<FormFieldTypes>
            form={form}
            onFinish={handleSubmit}
            initialValues={{
               name: props.sparePart?.name,
               quantity: props.sparePart?.quantity,
               expirationDate: dayjs(props.sparePart?.expirationDate),
            }}
         >
            <Form.Item<FormFieldTypes> name="name" label="Tên linh kiện" rules={[{ required: true }]}>
               <Input placeholder="Nhập tên linh kiện" />
            </Form.Item>
            <Form.Item<FormFieldTypes>
               name="quantity"
               label="Số lượng trong kho"
               rules={[
                  { required: true },
                  {
                     transform: (value) => Number(value),
                     validator: (rule, value, callback) => {
                        if (isNaN(value)) {
                           callback()
                        } else if (value < 0) {
                           callback("Số lượng không thể nhỏ hơn 0")
                        } else {
                           callback()
                        }
                     },
                  },
               ]}
            >
               <Input type="number" placeholder="Nhập số lượng" />
            </Form.Item>
            <Form.Item<FormFieldTypes> name="expirationDate" label="Ngày hết hạn" rules={[{ required: true }]}>
               <DatePicker placeholder="Nhập ngày hết hạn" />
            </Form.Item>
         </Form>
      </Drawer>
   )
}

export default SparePart_UpsertDrawer
export type { SparePart_UpsertDrawerProps }
