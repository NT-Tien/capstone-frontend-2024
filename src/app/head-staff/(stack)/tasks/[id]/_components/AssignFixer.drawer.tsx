import { ReactNode, useState } from "react"
import { Button, Card, Drawer, Form, Skeleton } from "antd"
import { useQuery } from "@tanstack/react-query"
import HeadStaff_Users_AllStaff from "@/app/head-staff/_api/users/all.api"
import { ProFormSelect } from "@ant-design/pro-components"

type FieldType = {
   staff: string
}

export default function AssignFixerDrawer({
   children,
   onFinish,
}: {
   children: (handleOpen: () => void) => ReactNode
   onFinish: (selectedUserId: string) => void
}) {
   const [open, setOpen] = useState(false)
   const [form] = Form.useForm<FieldType>()

   const staff = useQuery({
      queryKey: ["head-staff", "staff"],
      queryFn: () => HeadStaff_Users_AllStaff(),
   })

   function handleOpen() {
      setOpen(true)
   }

   function handleClose() {
      setOpen(false)
      form.resetFields()
   }

   return (
      <>
         {children(handleOpen)}
         <Drawer open={open} onClose={handleClose} title={"Assign Fixer"} placement={"bottom"} height={"max-content"}>
            <Card className="mb-3">Select a staff member to perform this task.</Card>
            <Skeleton loading={staff.isLoading}>
               <Form<FieldType>
                  form={form}
                  onFinish={(values) => {
                     handleClose()
                     onFinish(values.staff)
                  }}
               >
                  <ProFormSelect
                     name="staff"
                     placeholder={"Select a staff member"}
                     options={staff.data?.map((s) => ({
                        label: s.username,
                        value: s.id,
                     }))}
                     fieldProps={{
                        size: "large",
                     }}
                     rules={[
                        {
                           required: true,
                           message: "This field is required.",
                        },
                     ]}
                  />
               </Form>
            </Skeleton>

            <Button className="mt-3 w-full" type="primary" onClick={form.submit} size="large">
               Submit
            </Button>
         </Drawer>
      </>
   )
}
