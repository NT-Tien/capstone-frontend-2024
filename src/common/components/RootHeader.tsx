"use client"

import { Button, ButtonProps } from "antd"
import { ContainerFilled } from "@ant-design/icons"
import { CSSProperties, useEffect, useState } from "react"
import { cn } from "@/common/util/cn.util"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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
   const { i18n } = useTranslation()
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()
   const [locale, setLocale] = useState<string | undefined>(undefined)
   const [currentLanguage, setCurrentLanguage] = useState<string | null>(i18n.language)

   useEffect(() => {
      if (typeof window !== "undefined" && searchParams.get("locale")) {
         setLocale(searchParams.get("locale") || undefined)
      }
   }, [searchParams])

   const changeLanguage = (lng: string) => {
      i18n.changeLanguage(lng)
      const newSearchParams = new URLSearchParams(window.location.search)
      newSearchParams.set("locale", lng)
      router.push(`${pathname}?${newSearchParams.toString()}`)
      setCurrentLanguage(lng)
   }

   return (
      <div className={cn("flex h-min w-full items-center justify-between bg-[#FEF7FF]", className)} style={style}>
         <span className="mb-0 flex items-center gap-3 text-xl font-semibold">
            {onIconClick ? <Button icon={icon} type="text" onClick={onIconClick} {...buttonProps} /> : icon}
            {title}
         </span>
         <div style={{ display: "flex", justifyContent: "right" }}>
            {currentLanguage === "eng" && (
               <Button
                  onClick={() => changeLanguage("vie")}
                  style={{
                     border: 0,
                     width: "auto", // Adjust width to fit content
                     height: "2rem",
                     borderRadius: "999px",
                     backgroundColor: "rgba(0,0,0,0.8)",
                     color: "#FFFFFF",
                     display: "flex",
                     alignItems: "center",
                     padding: "0 10px",
                  }}
               >
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     width="1.5rem"
                     height="1.5rem"
                     viewBox="0 0 32 32"
                     style={{ marginRight: "5px" }}
                  >
                     <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#c93728"></rect>
                     <path
                        d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z"
                        opacity=".15"
                     ></path>
                     <path
                        d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z"
                        fill="#fff"
                        opacity=".2"
                     ></path>
                     <path
                        fill="#ff5"
                        d="M18.008 16.366L21.257 14.006 17.241 14.006 16 10.186 14.759 14.006 10.743 14.006 13.992 16.366 12.751 20.186 16 17.825 19.249 20.186 18.008 16.366z"
                     ></path>
                  </svg>
                  VIE
               </Button>
            )}
            {currentLanguage === "vie" && (
               <Button
                  onClick={() => changeLanguage("eng")}
                  style={{
                     display: "flex",
                     alignItems: "center",
                     backgroundColor: "rgba(0, 0, 0, 0.8)",
                     color: "#FFFFFF",
                     border: 0,
                     borderRadius: "999px",
                     padding: "0.5rem",
                  }}
               >
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     width="20"
                     height="20"
                     viewBox="0 0 32 32"
                     style={{ marginRight: "5px" }}
                  >
                     <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#071b65"></rect>
                     <path
                        d="M5.101,4h-.101c-1.981,0-3.615,1.444-3.933,3.334L26.899,28h.101c1.981,0,3.615-1.444,3.933-3.334L5.101,4Z"
                        fill="#fff"
                     ></path>
                     <path
                        d="M22.25,19h-2.5l9.934,7.947c.387-.353,.704-.777,.929-1.257l-8.363-6.691Z"
                        fill="#b92932"
                     ></path>
                     <path
                        d="M1.387,6.309l8.363,6.691h2.5L2.316,5.053c-.387,.353-.704,.777-.929,1.257Z"
                        fill="#b92932"
                     ></path>
                     <path
                        d="M5,28h.101L30.933,7.334c-.318-1.891-1.952-3.334-3.933-3.334h-.101L1.067,24.666c.318,1.891,1.952,3.334,3.933,3.334Z"
                        fill="#fff"
                     ></path>
                     <rect x="13" y="4" width="6" height="24" fill="#fff"></rect>
                     <rect x="1" y="13" width="30" height="6" fill="#fff"></rect>
                     <rect x="14" y="4" width="4" height="24" fill="#b92932"></rect>
                     <rect
                        x="14"
                        y="1"
                        width="4"
                        height="30"
                        transform="translate(32) rotate(90)"
                        fill="#b92932"
                     ></rect>
                     <path
                        d="M28.222,4.21l-9.222,7.376v1.414h.75l9.943-7.94c-.419-.384-.918-.671-1.471-.85Z"
                        fill="#b92932"
                     ></path>
                     <path
                        d="M2.328,26.957c.414,.374,.904,.656,1.447,.832l9.225-7.38v-1.408h-.75L2.328,26.957Z"
                        fill="#b92932"
                     ></path>
                     <path
                        d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z"
                        opacity=".15"
                     ></path>
                     <path
                        d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z"
                        fill="#fff"
                        opacity=".2"
                     ></path>
                  </svg>
                  ENG
               </Button>
            )}
         </div>
      </div>
   )
}
