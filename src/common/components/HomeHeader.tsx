"use client"

import { cn } from "@/common/util/cn.util"
import { decodeJwt } from "@/common/util/decodeJwt.util"
import { Avatar, Button, Col, Flex, Row, Skeleton, Typography } from "antd"
import Cookies from "js-cookie"
import { CSSProperties, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UserOutlined, MenuOutlined } from "@ant-design/icons"

type HeadStaffDashboardHeaderProps = {
   className?: string
   style?: CSSProperties
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
      <Col className={cn(props.className)} style={props.style}>
         <Row gutter={[16, 0]} align="middle">
            <Col>
               <Flex justify="flex-start" className="w-full">
                  <MenuOutlined style={{ color: '#FFFFFF', fontSize: '1.5rem' }} />
               </Flex>
            </Col>
            <Col flex="auto">
               <Row justify="end">
                  <Typography.Text className="text-base text-white">Chào buổi sáng</Typography.Text>
               </Row>
               <Row justify="end">
                  {token ? (
                     <h1 className="mb-0 mt-1 text-3xl font-bold text-white" key="name">
                        {decodeJwt(token).username}
                     </h1>
                  ) : (
                     <Skeleton.Button className="h-12 w-full" key="load" />
                  )}
               </Row>
            </Col>
            <Col>
               <Avatar style={{ backgroundColor: '#FFFFFF' }} size={60} icon={<UserOutlined style={{ color: '#6A7A91' }} />} />
            </Col>
         </Row>
      </Col>
   )
}
