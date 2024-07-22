"use client"

import { Button, Col, Flex, Row, Typography } from "antd"
import { decodeJwt } from "@/common/util/decodeJwt.util"
import Cookies from "js-cookie"
import { MenuOutlined } from "@ant-design/icons"
import { cn } from "@/common/util/cn.util"

type HeadStaffDashboardHeaderProps = {
   className?: string
}

export default function HeadStaffDashboardHeader(props: HeadStaffDashboardHeaderProps) {
   const currentToken = Cookies.get("token")

   return (
      <Col className={cn(props.className)}>
         <Row>
            <Flex justify="flex-end" className="w-full">
               <Button type="text" icon={<MenuOutlined />} />
            </Flex>
         </Row>
         <Row>
            <Typography.Text className="text-base">Chào buổi sáng</Typography.Text>
         </Row>
         <Row>
            <Typography.Title level={3} className="mt-1 text-3xl font-bold">
               {/* TODO change currentToken to skeleton loader */}
               {currentToken ? decodeJwt(currentToken).username : "Sang Dang"}
            </Typography.Title>
         </Row>
      </Col>
   )
}
