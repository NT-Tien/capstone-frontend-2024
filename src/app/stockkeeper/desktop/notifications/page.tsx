"use client"
import React from "react";
import { PageContainer } from "@ant-design/pro-components"
import { useEffect, useState } from "react"
import { Card, Spin, Alert } from "antd"
import Cookies from "js-cookie"
import axios from "axios"
import { ToolOutlined, AppstoreAddOutlined, CheckCircleOutlined } from "@ant-design/icons"
function Page() {
   const [notification, setNotification] = useState<any[]>([])
   const [loading, setLoading] = useState<boolean>(true)
   const [error, setError] = useState<string | null>(null)
   const fetchNotification = async () => {
      try {
         const response = await axios.get("http://localhost:8080/api/stockkeeper/notification/search/1/10", {
            headers: {
               Authorization: `Bearer ${Cookies.get("token")}`,
            },
         })
         console.log("response: ")
         console.log(response.data.data[0])
         setNotification(response.data.data[0])
         setLoading(false)
      } catch (error) {
         setError("Có lỗi khi tải thông báo.")
         setLoading(false)
      }
   }

   useEffect(() => {
      fetchNotification()
   }, [])

   if (loading) {
      return (
         <PageContainer title="Thông báo">
            <div className="flex min-h-screen items-center justify-center">
               <Spin tip="Đang tải thông báo..." />
            </div>
         </PageContainer>
      )
   }

   if (error) {
      return (
         <PageContainer title="Thông báo">
            <Alert message={`Lỗi: ${error}`} type="error" />
         </PageContainer>
      )
   }

   const handleClick = (item: any) => {
      if (item.title === "Nhập mới linh kiện") {
         window.location.href = "/stockkeeper/desktop/spare-parts/missing?current=1&pageSize=10";
      } else if (item.title === "Xác nhận xuất thiết bị/ linh kiện") {
         window.location.href = "/stockkeeper/desktop/tasks/scan?taskid=" + item.data.taskId;
      } else if (item.title === "Tác vụ mới") {
         window.location.href = "/stockkeeper/desktop/spare-parts/export?ticketid=" + item.data.ticketId;
      }
   }
   return (
      <PageContainer title="Thông báo">
         <div className="space-y-2">
            {notification.length > 0 ? (
               notification.map((item: any) => (
                  <div
                     key={item.id}
                     className="custom-card relative flex flex-col rounded-lg border border-gray-300 p-2 p-4 shadow-lg"
                     onClick={() => handleClick(item)}
                  >
                     {item.seenDate === null && (
                        <div className="absolute right-1 top-1">
                           <div className="absolute right-2 top-2 h-3 w-3 rounded-full bg-red-500"></div>
                        </div>
                     )}

                     <div className="flex items-center gap-2">
                        {item.title === "Tác vụ mới" ? (
                           <ToolOutlined className="icon-size text-blue-600" />
                        ) : item.title === "Nhập mới linh kiện" ? (
                           <AppstoreAddOutlined className="icon-size text-green-600" />
                        ) : item.title === "Xác nhận xuất thiết bị/ linh kiện" ? (
                           <CheckCircleOutlined className="icon-size text-yellow-600" />
                        ) : (
                           <div className="text-gray-400"> </div>
                        )}
                        <h2 className="text-sm font-semibold text-blue-600">{item.title}</h2>
                     </div>
                     <p className="text-xs text-gray-700">{item.body}</p>
                  </div>
               ))
            ) : (
               <div className="alert-info">Không có thông báo nào.</div>
            )}
         </div>
      </PageContainer>
   )
}

export default Page
