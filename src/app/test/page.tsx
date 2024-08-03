"use client"

import React, { useState } from "react"
import { Hourglass, ThumbsUp, XCircle } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import IssueDetailsDrawer from "@/app/staff/_components/IssueDetails.drawer"
import { Button, Drawer } from "antd"
import useModalControls from "@/common/hooks/useModalControls"

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
      <React.Fragment>
         <Button onClick={handleOpen}>Open</Button>
         <Drawer
            title="Nhập thủ công"
            placement="bottom"
            onClose={handleClose}
            open={open}
            height="max-content"
            classNames={{
               body: "flex flex-col",
            }}
            className="z-[1000]"
         >
            ahihi
         </Drawer>
      </React.Fragment>
   )
}
