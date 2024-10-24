"use client"

import { Button, Drawer, DrawerProps } from "antd"

type Request_ViewMiniDetailsDrawerProps = {}
type Props = Omit<DrawerProps, "children"> & Request_ViewMiniDetailsDrawerProps

function Request_ViewMiniDetailsDrawer(props: Props) {
   return (
      <Drawer
         title="Thông tin yêu cầu"
         placement={"bottom"}
         height={"80%"}
         classNames={{
            footer: "p-layout",
         }}
         footer={
            <Button block size={"large"}>
               Xem chi tiết
            </Button>
         }
         {...props}
      ></Drawer>
   )
}

export default Request_ViewMiniDetailsDrawer
export type { Request_ViewMiniDetailsDrawerProps }
