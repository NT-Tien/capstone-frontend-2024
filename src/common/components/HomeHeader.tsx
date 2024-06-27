"use client"

import { Button, Col, Flex, Row, Typography } from "antd"
import { decodeJwt } from "@/common/util/decodeJwt.util"
import Cookies from "js-cookie"
import { MenuOutlined } from "@ant-design/icons"
import { cn } from "@/common/util/cn.util"
import { CSSProperties, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type HeadStaffDashboardHeaderProps = {
   className?: string
   style?: CSSProperties
}

export default function HomeHeader(props: HeadStaffDashboardHeaderProps) {
   const currentToken = Cookies.get("token")
   const { i18n } = useTranslation();
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();
   const [locale, setLocale] = useState<string | undefined>(undefined);
   const { t } = useTranslation();
   const [currentLanguage, setCurrentLanguage] = useState<string | null>(i18n.language);

 
   useEffect(() => {
     if (typeof window !== 'undefined' && searchParams.get('locale')) {
       setLocale(searchParams.get('locale') || undefined);
     }
   }, [searchParams]);
 
   const changeLanguage = (lng: string) => {
     i18n.changeLanguage(lng);
     const newSearchParams = new URLSearchParams(window.location.search);
     newSearchParams.set('locale', lng);
     router.push(`${pathname}?${newSearchParams.toString()}`);
     setCurrentLanguage(lng)
   };

   return (
      <Col className={cn(props.className)} style={props.style}>
         <Row>
            <Flex justify="flex-end" className="w-full">
            {currentLanguage === 'eng' && (
        <Button onClick={() => changeLanguage('vie')}>VIE</Button>
      )}
      {currentLanguage === 'vie' && (
        <Button onClick={() => changeLanguage('eng')}>ENG</Button>
      )}            </Flex>
         </Row>
         <Row>
            <Typography.Text className="text-base">{t('Hello')}</Typography.Text>
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
