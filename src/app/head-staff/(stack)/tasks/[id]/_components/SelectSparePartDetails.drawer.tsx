import { ReactNode, useState } from "react"
import { SparePartDto } from "@/common/dto/SparePart.dto"
import { Button, Divider, Drawer, Form, InputNumber } from "antd"
import { ProDescriptions, ProFormDigit } from "@ant-design/pro-components"
import dayjs from "dayjs"

export type FieldType = {
   quantity: number
   sparePartId: string
}

export default function SelectSparePartDetailsDrawer({
   children,
   onFinish,
}: {
   children: (handleOpen: (sparePart: SparePartDto) => void) => ReactNode
   onFinish?: (values: FieldType) => void
}) {
   const [open, setOpen] = useState(false)
   const [sparePart, setSparePart] = useState<undefined | SparePartDto>(undefined)
   const [form] = Form.useForm()

   function handleOpen(sparePart: SparePartDto) {
      setOpen(true)
      setSparePart(sparePart)
   }

   function handleClose() {
      setOpen(false)
      setSparePart(undefined)
   }

   function handleFinish(values: FieldType) {
      if (sparePart) {
         handleClose()
         values.sparePartId = sparePart.id
         onFinish && onFinish(values)
      }
   }

   return (
      <>
         {children(handleOpen)}
         <Form form={form} onFinish={handleFinish} requiredMark={false}>
            <Drawer open={open} onClose={handleClose} placement="bottom" title="Spare Part Details">
               {sparePart && (
                  <div>
                     <ProDescriptions
                        dataSource={sparePart}
                        size="small"
                        columns={[
                           {
                              key: "name",
                              label: "Name",
                              dataIndex: "name",
                           },
                           {
                              key: "quantity",
                              label: "Quantity Remaining",
                              render: (_, e) => e.quantity + " left",
                           },
                           {
                              key: "exp",
                              label: "Expiration Date",
                              render: (_, e) => dayjs(e.expirationDate).format("DD/MM/YYYY"),
                           },
                        ]}
                     />
                     <Divider className="my-2" />
                     <div>
                        <ProFormDigit
                           name="quantity"
                           placeholder="Select Quantity"
                           label="How many do you need?"
                           initialValue={1}
                           min={1}
                           rules={[{ required: true, message: "This field is required." }]}
                        />
                     </div>
                  </div>
               )}
               <div className="absolute bottom-0 left-0 w-full p-4">
                  <Button className="w-full" type="primary" size="large" onClick={form.submit}>
                     Confirm
                  </Button>
               </div>
            </Drawer>
         </Form>
      </>
   )
}
