"use client"

import { cn } from "@/common/util/cn.util"
import { decodeJwt } from "@/common/util/decodeJwt.util"
import { MoreOutlined } from "@ant-design/icons"
import { Button, Col, Flex, Row, Typography } from "antd"
import Cookies from "js-cookie"
import { CSSProperties } from "react"

type HeadStaffDashboardHeaderProps = {
   className?: string
   style?: CSSProperties
}

export default function HomeHeader(props: HeadStaffDashboardHeaderProps) {
   const currentToken = Cookies.get("token")

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
            <h1 className="mb-0 mt-1 text-3xl font-bold">{currentToken ? decodeJwt(currentToken).username : "User"}</h1>
         </Row>
      </Col>
   )
}
