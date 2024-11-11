import { Button, Divider, Drawer, DrawerProps } from "antd"
import { CloseOutlined } from "@ant-design/icons"
import { Note } from "@phosphor-icons/react"

type ViewDetailsDrawerProps = {
   text: string
}
type Props = Omit<DrawerProps, "children"> & ViewDetailsDrawerProps

function ViewDetailsDrawer(props: Props) {
   return (
      <Drawer
         closeIcon={false}
         placement="right"
         width="100%"
         classNames={{
            body: "p-layout-half",
         }}
         {...props}
      >
         <header className="flex items-center">
            <h1 className="mr-auto text-base font-bold flex gap-1 items-center">
               <Note size="18" weight="fill" />
               Ghi chú
            </h1>
            <Button type="text" icon={<CloseOutlined />} size="small" onClick={props.onClose} />
         </header>
         <Divider className="my-2" />
         <main className="mt-2">{props.text}</main>
      </Drawer>
   )
}

export default ViewDetailsDrawer
export type { ViewDetailsDrawerProps }
