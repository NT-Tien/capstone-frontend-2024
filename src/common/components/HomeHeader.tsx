"use client"

import { cn } from "@/common/util/cn.util"
import { decodeJwt } from "@/common/util/decodeJwt.util"
import { MoreOutlined } from "@ant-design/icons"
import { Button, Col, Flex, Row, Skeleton, Typography } from "antd"
import Cookies from "js-cookie"
import { CSSProperties, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

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
         <Row>
            <Flex justify="flex-end" className="w-full">
               <Button icon={<MoreOutlined />} type="default"></Button>
            </Flex>
         </Row>
         <Row>
            <Typography.Text className="text-base">Chào buổi sáng</Typography.Text>
         </Row>
         <Row>
            {token ? (
               <h1 className="mb-0 mt-1 text-3xl font-bold" key="name">
                  {decodeJwt(token).username}
               </h1>
            ) : (
               <Skeleton.Button className="h-12 w-full" key="load" />
            )}
         </Row>
      </Col>
   )
}
