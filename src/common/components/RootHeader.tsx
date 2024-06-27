"use client"

import { Button, ButtonProps } from "antd"
import { ContainerFilled, MenuOutlined } from "@ant-design/icons"
import { CSSProperties, useEffect, useState } from "react"
import { cn } from "@/common/util/cn.util"
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import vie from "../locales/vie"
import eng from "../locales/eng"
import { useTranslation } from "react-i18next"

type Props = {
   title: string
   icon?: JSX.Element
   onIconClick?: () => void
   style?: CSSProperties
   buttonProps?: Omit<ButtonProps, "onClick">
   className?: string
}

export default function RootHeader({
   title,
   style,
   onIconClick,
   buttonProps,
   icon = <ContainerFilled className="text-lg" />,
   className,
}: Props) {
  const { i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<string | undefined>(undefined);

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
  };

   return (
      // <div className={cn("flex h-min w-full items-center justify-between bg-[#FEF7FF]", className)} style={style}>
      //    <span className="mb-0 flex items-center gap-3 text-xl font-semibold">
      //       {onIconClick ? <Button icon={icon} type="text" onClick={onIconClick} {...buttonProps} /> : icon}
      //       {title}
      //    </span>
      //    <Button type="text" icon={<MenuOutlined />} />
      // </div>
      <div style={{ display: "flex", justifyContent: "right" }}>
         <Button onClick={() => changeLanguage("eng")}>ENG</Button>
         <Button onClick={() => changeLanguage("vie")}>VIE</Button>{" "}
      </div>
   )
}
