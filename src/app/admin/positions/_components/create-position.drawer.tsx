import { ReactNode, useState } from "react"
import { DrawerForm, ProForm, ProFormDigit, ProFormSelect } from "@ant-design/pro-components"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { App } from "antd"
import qk from "@/common/querykeys"
import Positions_Create from "@/app/admin/_api/positions/create.api"
import Areas_All from "@/app/admin/_api/areas/all.api"

type FieldType = {
   area: string
   positionX: number
   positionY: number
}

export default function CreatePositionDrawer({ children }: { children: (handleOpen: () => void) => ReactNode }) {
   const [open, setOpen] = useState(false)
   const [form] = ProForm.useForm()
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   const mutate_createPosition = useMutation({
      mutationFn: Positions_Create,
      onMutate: async () => {
         message.open({
            content: "Creating position...",
            key: "createPosition",
            type: "loading",
            duration: 0,
         })
      },
      onError: async () => {
         message.error("Create position failed")
      },
      onSuccess: async () => {
         message.success("Create position successful")
         await queryClient.invalidateQueries({
            queryKey: qk.positions.all(),
         })
      },
      onSettled: async () => {
         message.destroy("createPosition")
      },
   })

   function handleOpen() {
      setOpen(true)
   }

   function handleClose() {
      setOpen(false)
      form.resetFields()
   }

   async function handleSubmit(props: FieldType) {
      mutate_createPosition.mutate(props, {
         onSuccess: () => {
            handleClose()
         },
      })
   }

   return (
      <>
         {children(handleOpen)}
         <DrawerForm
            open={open}
            title="Create Position"
            form={form}
            onFinish={handleSubmit}
            onReset={() => form.resetFields()}
            drawerProps={{
               onClose: handleClose,
            }}
         >
            <ProFormSelect
               name="area"
               label="Area"
               placeholder="Select an Area"
               showSearch
               request={async () => {
                  return (
                     await queryClient.ensureQueryData({
                        queryKey: qk.areas.all(),
                        queryFn: () => Areas_All(),
                     })
                  ).map((area) => ({
                     label: area.name,
                     value: area.id,
                  }))
               }}
               rules={[{ required: true }]}
            />
            <ProFormDigit
               name="positionX"
               label="Position X"
               rules={[{ required: true }, { transform: (value) => Number(value), min: 0 }]}
            />
            <ProFormDigit
               name="positionY"
               label="Position Y"
               rules={[{ required: true }, { transform: (value) => Number(value), min: 0 }]}
            />
         </DrawerForm>
      </>
   )
}
