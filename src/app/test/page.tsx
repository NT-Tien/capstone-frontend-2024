"use client"

import DataListView from "@/common/components/DataListView"
import useModalControls from "@/common/hooks/useModalControls"
import { Hourglass, ThumbsUp, XCircle } from "@phosphor-icons/react"
import { Button, Drawer } from "antd"
import { useRouter } from "next/navigation"
import React, { lazy, useState } from "react"

export default function TestPage() {
   const [tab, setTab] = useState<string>("pending")
   const router = useRouter()
   const { handleClose, handleOpen, open } = useModalControls()
   const tabs = [
      {
         key: "pending",
         title: "Đang chờ",
         icon: <Hourglass size={20} />,
         children: "pending",
      },
      {
         key: "approved",
         title: "Đã duyệt",
         icon: <ThumbsUp size={20} />,
         children: "appoved",
      },
      {
         key: "rejected",
         title: "Từ chối",
         icon: <XCircle size={20} />,
         children: "reje",
      },
      {
         key: "in-progress",
         title: "Đang xử lý",
         icon: <Hourglass size={20} />,
         children: "progre",
      },
      {
         key: "closed",
         title: "Đã đóng",
         icon: <XCircle size={20} />,
         children: "close",
      },
   ]

   return (
      <div className="std-layout">
         <Button>My button</Button>
         <div className="bg-red-500">Div</div>
         <div className="bg-blue-500 std-layout-outer">TEst</div>
      </div>
   )

   // return (
   //    <React.Fragment>
   //       <Button onClick={handleOpen}>Open</Button>
   //       <Drawer
   //          title="Nhập thủ công"
   //          placement="bottom"
   //          onClose={handleClose}
   //          open={open}
   //          height="max-content"
   //          classNames={{
   //             body: "flex flex-col",
   //          }}
   //          className="z-[1000]"
   //       >
   //          ahihi
   //       </Drawer>
   //    </React.Fragment>
   // )
}
