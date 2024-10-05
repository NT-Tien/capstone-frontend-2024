"use client"

import { Drawer, DrawerProps, Tabs } from "antd"
import Button from "antd/es/button"
import { CloseOutlined } from "@ant-design/icons"
import { Role } from "@/lib/domain/User/role.enum"
import { useState } from "react"
import Head_DepartmentSection from "@/components/SuperUser/Head_Department.section"
import Head_MaintenanceSection from "@/components/SuperUser/Head_Maintenance.section"

type SuperUserDrawerProps = {}

type Props = Omit<DrawerProps, "children"> & SuperUserDrawerProps

function SuperUserDrawer(props: Props) {
   const [tab, setTab] = useState<Role>(Role.head)

   return (
      <Drawer
         classNames={{
            header: "pb-0",
         }}
         title={
            <div className="flex flex-col gap-3">
               <div className="flex items-center gap-2">
                  <Button icon={<CloseOutlined />} type="text" onClick={(e) => props.onClose?.(e)} />
                  <h1>Super User Actions</h1>
               </div>
               <Tabs
                  tabBarStyle={{
                     marginBottom: 0,
                  }}
                  activeKey={tab}
                  onChange={(key) => setTab(key as Role)}
                  items={[
                     {
                        label: "Head Department",
                        key: Role.head,
                     },
                     {
                        label: "Head Maintenance",
                        key: Role.headstaff,
                     },
                     {
                        label: "Staff",
                        key: Role.staff,
                     },
                     {
                        label: "Stockkeeper",
                        key: Role.stockkeeper,
                     },
                  ]}
               />
            </div>
         }
         width={"100%"}
         placement="right"
         closeIcon={null}
         {...props}
      >
         {tab === Role.head && <Head_DepartmentSection />}
         {tab === Role.headstaff && <Head_MaintenanceSection />}
      </Drawer>
   )
}

export default SuperUserDrawer
export type { SuperUserDrawerProps }
