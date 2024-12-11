"use client"

import DeviceDetails from "@/features/head-maintenance/components/DeviceDetails"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { UseQueryResult } from "@tanstack/react-query"
import { Card, ConfigProvider, Tabs } from "antd"
import { useState } from "react"

type Props = {
   api_request: UseQueryResult<RequestDto, Error>
}

function DeviceTab(props: Props) {
   const [tab, setTab] = useState<string>("current")

   const shouldRender_tabs =
      props.api_request.isSuccess && props.api_request.data?.device.id !== props.api_request.data?.old_device.id

   if (!props.api_request.isSuccess) return <Card loading />

   return (
      <ConfigProvider
         theme={{
            components: {
               Tabs: {
                  inkBarColor: "#a3a3a3",
                  itemActiveColor: "#737373",
                  itemSelectedColor: "#737373",
                  itemColor: "#a3a3a3",
                  titleFontSize: 14,
               },
            },
         }}
      >
         {shouldRender_tabs ? (
            <Tabs
               activeKey={tab}
               onChange={setTab}
               renderTabBar={(props, Default) => {
                  return (
                     <div className="">
                        <Default {...props} />
                     </div>
                  )
               }}
               className="test-tabs"
               animated={{
                  inkBar: true,
                  tabPane: true,
                  tabPaneMotion: {
                     motionAppear: false,
                     motionLeave: false,
                     motionEnter: false,
                  },
               }}
               items={[
                  {
                     key: "current",
                     label: "Hiện tại",
                     children: (
                        <DeviceDetails device={props.api_request.data.device} className="border-none p-layout" />
                     ),
                  },
                  {
                     key: "original",
                     label: "Ban đầu",
                     children: (
                        <DeviceDetails device={props.api_request.data.old_device} className="border-none p-layout" />
                     ),
                  },
               ]}
            />
         ) : (
            <DeviceDetails device={props.api_request.data.device} className="border-none p-layout" />
         )}
      </ConfigProvider>
   )
}

export default DeviceTab
