"use client"

import React, { CSSProperties, MouseEvent, ReactNode, UIEvent, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils/cn.util"
import { Badge, BadgeProps } from "antd"

type Props<T> = {
   items: {
      key: string
      title: string
      icon?: ReactNode
      children?: ReactNode
      badge?: number
   }[]
   tabType?: "vertical" | "horizontal"
   className?: string
   classNames?: {
      content?: string
      tab?: string
      tabContainer?: string
   }
   style?: CSSProperties
   styles?: {
      content?: CSSProperties
      tab?: CSSProperties
      tabContainer?: CSSProperties
   }
   renderTab?: (title: string, icon?: ReactNode, badge?: number) => ReactNode
   tab?: T
   onTabChange?: (key: T) => void
   defaultActiveTab?: string
}

export default function ScrollableTabs<T>(props: Props<T>) {
   const [currentTab, setCurrentTab] = useState<string>(props.defaultActiveTab ?? props.items[0].key)
   const [showStartGradient, setShowStartGradient] = useState(false)
   const [showEndGradient, setShowEndGradient] = useState(false)
   const [bottomBorderPosition, setBottomBorderPosition] = useState({ left: 0, width: 0 })
   const tabContainerRef = useRef<HTMLDivElement | null>(null)
   const tabsRef = useRef<HTMLButtonElement[]>([])

   function handleScroll(e: UIEvent<HTMLDivElement>) {
      const target = e.currentTarget
      const isAtStart = target.scrollLeft <= 20
      const isAtEnd = target.scrollLeft + target.clientWidth >= target.scrollWidth - 20
      setShowStartGradient(!isAtStart)
      setShowEndGradient(!isAtEnd)
   }

   function handleTabClick(key: string, index: number, e: MouseEvent<HTMLButtonElement>) {
      !!props.onTabChange ? props.onTabChange(key as any) : setCurrentTab(key)

      if (tabContainerRef.current) {
         const tabElement = tabContainerRef.current.querySelector(`#${key}`)
         tabElement?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
      }

      const tabRect = tabsRef.current[index].getBoundingClientRect()
      setBottomBorderPosition({ left: tabRect.left, width: tabRect.width })
      createRipple(e)
   }

   function createRipple(e: MouseEvent<HTMLButtonElement>) {
      const button = e.currentTarget
      const rippleContainer = button.getElementsByClassName("ripple-container")[0]

      const rect = button.getBoundingClientRect() // Get button's rect
      const x = e.clientX - rect.left // Get relative x within button
      const y = e.clientY - rect.top // Get relative y within button

      const circle = document.createElement("span")
      const diameter = Math.max(button.clientWidth, button.clientHeight)

      circle.style.width = circle.style.height = `${diameter}px`
      circle.style.left = `${x}px`
      circle.style.top = `${y}px`
      circle.classList.add("ripple")

      const ripple = rippleContainer.getElementsByClassName("ripple")[0]
      if (ripple) {
         ripple.remove()
      }

      rippleContainer.appendChild(circle)
   }

   useEffect(() => {
      const tabContainerRefCurrent = tabContainerRef.current
      const updateBorderPosition = () => {
         const tabRect =
            tabsRef.current[
               props.items.findIndex((tab) => tab.key === (props.tab ?? currentTab))
            ].getBoundingClientRect()
         setBottomBorderPosition({ left: tabRect.left, width: tabRect.width })
      }

      if (tabContainerRefCurrent) {
         tabContainerRefCurrent.addEventListener("scroll", updateBorderPosition)
         return () => tabContainerRefCurrent.removeEventListener("scroll", updateBorderPosition)
      }
   }, [currentTab, props.items, props.tab])

   useEffect(() => {
      const initialActiveTab = tabsRef.current.find((tab) => tab.id === (props.tab ?? currentTab))
      if (initialActiveTab) {
         const tabRect = initialActiveTab.getBoundingClientRect()
         setBottomBorderPosition({ left: tabRect.left, width: tabRect.width })
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   return (
      <>
         <div className={cn("relative w-full shadow-bottom", props.className)} style={props.style}>
            <div
               className={cn(
                  "tabs-gradient pointer-events-none absolute left-0 top-0 h-full w-16 rotate-180 opacity-0 transition-all",
                  props.items.length > 4 && showStartGradient && "opacity-100",
               )}
            />
            <div
               className={cn(
                  "w-full overflow-x-auto bg-white",
                  props.items.length === 2 && "grid grid-cols-2 *:w-full",
                  props.items.length === 3 && "grid grid-cols-3 *:w-full",
                  props.items.length === 4 && "grid grid-cols-4 *:w-full",
                  props.items.length > 4 && "hide-scrollbar flex",
                  props.classNames?.tabContainer,
               )}
               style={props.styles?.tabContainer}
               ref={tabContainerRef}
               onScroll={handleScroll}
            >
               {props.items.map((tab, index) => (
                  <button
                     key={tab.key}
                     id={tab.key}
                     className="group relative box-border h-full w-max whitespace-nowrap px-4 py-4 transition-all duration-300"
                     onClick={(e) => {
                        handleTabClick(tab.key, index, e)
                     }}
                     ref={(el) => (tabsRef.current[index] = el!) as any}
                  >
                     {props.renderTab ? (
                        <>{props.renderTab(tab.title, tab.icon, tab.badge)}</>
                     ) : (
                        <div
                           className={cn(
                              "flex items-center justify-center",
                              props.tabType === "vertical" && "flex-col gap-1",
                              (props.tabType === "horizontal" || props.tabType === undefined) && "flex-row",
                              props.classNames?.tab,
                           )}
                           style={props.styles?.tab}
                        >
                           <div
                              className={cn(
                                 (!!props.tab ? props.tab === tab.key : currentTab === tab.key) &&
                                    "font-medium text-primary-500",
                              )}
                           >
                              {tab.icon}
                           </div>
                           <span
                              className={cn(
                                 "ml-2 w-max",
                                 (!!props.tab ? props.tab === tab.key : currentTab === tab.key) &&
                                    "font-medium text-primary-500",
                              )}
                           >
                              {tab.title}
                           </span>
                           {!!tab.badge && tab.badge !== 0 && (
                              <span
                                 className={cn(
                                    "ml-1 text-xs text-neutral-500",
                                    (!!props.tab ? props.tab === tab.key : currentTab === tab.key) &&
                                       "font-medium text-primary-300",
                                 )}
                              >
                                 ({tab.badge})
                              </span>
                           )}
                        </div>
                     )}
                     <span className="ripple-container absolute inset-0 h-full w-full overflow-hidden rounded-t-sm"></span>
                  </button>
               ))}
            </div>
            <div
               className="absolute bottom-0 left-0 h-0.5 rounded-full bg-primary-500 transition-all duration-300"
               style={{ transform: `translateX(${bottomBorderPosition.left}px)`, width: bottomBorderPosition.width }}
            />
            <div
               className={cn(
                  "tabs-gradient pointer-events-none absolute right-0 top-0 h-full w-16 opacity-0 transition-all",
                  props.items.length > 4 && showEndGradient && "opacity-100",
               )}
            />
         </div>
         {props.items.map((tab) => (
            <div
               key={`content-${tab.key}`}
               className={cn("hidden", tab.key === (props.tab ?? currentTab) && "block", props.classNames?.content)}
               style={props.styles?.content}
            >
               {tab.children}
            </div>
         ))}
      </>
   )
}
