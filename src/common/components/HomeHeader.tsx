"use client"

import { Col, Dropdown, Flex, Row, Typography } from "antd"
import { decodeJwt } from "@/common/util/decodeJwt.util"
import Cookies from "js-cookie"
import { cn } from "@/common/util/cn.util"
import { CSSProperties } from "react"
import { useTranslation } from "react-i18next"
import LocaleSwitcher from "@/common/components/LocaleSwitcher"

type HeadStaffDashboardHeaderProps = {
   className?: string
   style?: CSSProperties
}

export default function HomeHeader(props: HeadStaffDashboardHeaderProps) {
   const currentToken = Cookies.get("token")
   const { t } = useTranslation()

   return (
      <Col className={cn(props.className)} style={props.style}>
         {/* <Row>
            <Flex justify="flex-end" className="w-full">
               <LocaleSwitcher />
            </Flex>
         </Row> */}
         <Row>
            <Typography.Text className="text-base">Chào buổi sáng</Typography.Text>
         </Row>
         <Row>
            <h1 className="mb-0 mt-1 text-3xl font-bold">{currentToken ? decodeJwt(currentToken).username : "User"}</h1>
         </Row>
      </Col>
   )
}
