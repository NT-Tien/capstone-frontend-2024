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
         <Row>
            <Flex justify="flex-end" className="w-full">
               <LocaleSwitcher />
            </Flex>
         </Row>
         <Row>
            <Typography.Text className="text-base">{t("Hello")}</Typography.Text>
         </Row>
         <Row>
            <Typography.Title level={3} className="mb-0 mt-1 text-3xl font-bold">
               {/* TODO change currentToken to skeleton loader */}
               {currentToken ? decodeJwt(currentToken).username : "User"}
            </Typography.Title>
         </Row>
      </Col>
   )
}
