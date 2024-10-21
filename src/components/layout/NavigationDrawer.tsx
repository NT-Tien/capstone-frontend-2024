import { Avatar, Button, ButtonProps, Divider, Drawer, DrawerProps, Dropdown } from "antd"
import useCurrentUser from "@/lib/domain/User/useCurrentUser"
import {
   CloseOutlined,
   DownOutlined,
   HeartOutlined,
   LogoutOutlined,
   PhoneOutlined,
   UserOutlined,
} from "@ant-design/icons"
import LockOutlined from "@ant-design/icons/LockOutlined"
import { MouseEventHandler, ReactNode } from "react"
import { cn } from "@/lib/utils/cn.util"
import useLogout from "@/lib/domain/User/useLogout"
import { cva } from "class-variance-authority"
import dayjs from "dayjs"

const typeVariants = cva("", {
   variants: {
      bg: {
         head_department: "bg-head_department",
         head_maintenance: "bg-green-500",
         staff: "bg-yellow-500",
      },
      bgLight: {
         head_department: "bg-blue-50",
         head_maintenance: "bg-green-50",
         staff: "bg-yellow-50",
      },
      text: {
         head_department: "text-blue-500",
         head_maintenance: "text-green-500",
         staff: "text-yellow-500",
      },
   },
})

type NavigationDrawerItemProps = {
   key: string
   type: "item" | "divider"
   label: string
   icon: ReactNode
   onClick?: () => void
   closeAfterClick?: boolean
}
type NavigationDrawerProps = {
   items?: NavigationDrawerItemProps[]
   activeKey?: string
   onItemClick?: (item: NavigationDrawerItemProps) => void
   type?: "head_department" | "head_maintenance" | "staff"
}
type Props = Omit<DrawerProps, "children"> &
   NavigationDrawerProps & {
      instantClose?: () => void
   }

function NavigationDrawer(props: Props) {
   const currentUser = useCurrentUser()
   const [logout] = useLogout()

   return (
      <Drawer
         closeIcon={false}
         placement="left"
         width="80%"
         title={
            <div className="font-normal text-white">
               <div className={"mb-6 flex items-center justify-between text-sm"}>
                  <div className="font-light">{dayjs().locale("vi").format("dddd, DD/MM/YYYY")}</div>
                  <Button icon={<CloseOutlined className="text-white" />} onClick={props.onClose} type="text"></Button>
               </div>
               <Avatar size={56} icon={<UserOutlined />}></Avatar>
               <div className="mt-2 flex items-end justify-between">
                  <div>
                     <h1 className="text-lg font-bold">{currentUser.username}</h1>
                     <span className="text-base font-light">{currentUser.phone}</span>
                  </div>
                  <Dropdown
                     menu={{
                        items: [
                           {
                              label: "Cập nhật mật khẩu",
                              key: "change-password",
                              icon: <LockOutlined />,
                              onClick: () => {},
                           },
                           {
                              label: "Cập nhật số điện thoại",
                              key: "update-phone",
                              icon: <PhoneOutlined />,
                              onClick: () => {},
                           },
                        ],
                     }}
                  >
                     <Button type="text" icon={<DownOutlined className="text-sm text-white" />} />
                  </Dropdown>
               </div>
            </div>
         }
         footer={
            <NavigationDrawer.ItemButton
               icon={<LogoutOutlined />}
               label="Đăng xuất"
               buttonProps={{ danger: true }}
               onClick={() => {
                  logout?.()
               }}
            />
         }
         classNames={{
            header: cn("p-layout", typeVariants({ bg: props.type })),
            body: "p-0",
            footer: "p-2",
         }}
         {...props}
      >
         <ul className="p-2">
            {props.items?.map((item, index) => (
               <li key={item.label + index}>
                  {item.type === "item" ? (
                     <NavigationDrawer.ItemButton
                        icon={item.icon}
                        label={item.label}
                        onClick={(e) => {
                           if (item.closeAfterClick !== false) {
                              props?.instantClose?.()
                           }

                           if (item.onClick) item.onClick()
                           else if (props.onItemClick) props.onItemClick(item)
                        }}
                        isActive={props.activeKey === item.key}
                        type={props.type}
                     />
                  ) : (
                     <Divider />
                  )}
               </li>
            ))}
         </ul>
      </Drawer>
   )
}

type NavigationDrawerItemButtonProps = {
   icon: ReactNode
   label: string
   onClick?: MouseEventHandler<HTMLElement>
   buttonProps?: Omit<ButtonProps, "onClick">
   isActive?: boolean
   type?: NavigationDrawerProps["type"]
}

NavigationDrawer.ItemButton = function NavigationDrawerItemButton(props: NavigationDrawerItemButtonProps) {
   return (
      <Button
         block
         className={cn(
            "flex items-center justify-start gap-4 rounded-none py-6",
            !props.buttonProps?.danger && "text-neutral-500",
            props.isActive && typeVariants({ bgLight: props.type, text: props.type }),
         )}
         type="text"
         onClick={props.onClick}
         {...props.buttonProps}
      >
         {props.icon}
         {props.label}
      </Button>
   )
}

export default NavigationDrawer
export type { NavigationDrawerProps, NavigationDrawerItemProps, Props }
