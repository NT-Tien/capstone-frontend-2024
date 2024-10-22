"use client"

import { cn } from "@/lib/utils/cn.util"
import { decodeJwt } from "@/lib/domain/User/decodeJwt.util"
import { Avatar, Button, Col, Flex, Row, Skeleton, Typography } from "antd"
import Cookies from "js-cookie"
import { CSSProperties, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MenuOutlined, UserOutlined } from "@ant-design/icons"
import HeadMaintenanceNavigaionDrawer from "@/features/head-maintenance/components/layout/HeadMaintenanceNavigationDrawer"

type HeadStaffDashboardHeaderProps = {
   className?: string
   style?: CSSProperties
   onIconClick?: () => void
}

export default function HomeHeader(props: HeadStaffDashboardHeaderProps) {
   const [token, setToken] = useState<undefined | string>()
   const router = useRouter()

   useEffect(() => {
      const currentToken = Cookies.get("token")
      if (currentToken === undefined) {
         router.push("/login")
         return
      }
      setToken(currentToken)
   }, [router])

   return (
      <div>
         <Col className={cn(props.className)} style={props.style}>
            <Row gutter={[16, 0]} align="middle">
               <Col flex="auto">
                  <Button icon={<MenuOutlined />} onClick={props.onIconClick} />
               </Col>
               <Col flex="auto">
                  <Row justify="end">
                     <Typography.Text className="mb-0 text-sm" style={{ color: '#FFFFFF' }}>Chào buổi sáng</Typography.Text>
                  </Row>
                  <Row justify="end">
                     {token ? (
                        <h1 className="mb-0 mt-0 text-lg font-bold " key="name" style={{ color: '#FFFFFF' }}>
                           {decodeJwt(token).username}
                        </h1>
                     ) : (
                        <Skeleton.Button className="h-12 w-full" key="load" />
                     )}
                  </Row>
               </Col>
               <Col>
                  <Avatar
                     style={{ backgroundColor: "#FFFFFF" }}
                     size={50}
                     icon={<UserOutlined style={{ color: "#6A7A91" }} />}
                  />
               </Col>
            </Row>
         </Col>
      </div>
   )
}
