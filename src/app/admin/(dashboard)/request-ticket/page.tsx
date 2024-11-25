'use client'

import { PageContainer } from "@ant-design/pro-layout"
import { useEffect, useState } from "react"
import { ProTable } from "@ant-design/pro-components"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import dayjs from "dayjs"
import { Tag, Tooltip, Button, message } from "antd"
import { CheckOutlined, CloseOutlined } from "@ant-design/icons"
import { FixRequest_StatusMapper } from "@/lib/domain/Request/RequestStatus.mapper"
import Cookies from "js-cookie"

function RequestsPage() {
   const [query, setQuery] = useState({
      page: 1,
      limit: 10,
      search: {},
   })
   const [data, setData] = useState([])
   const [total, setTotal] = useState<number>(0)
   const [loading, setLoading] = useState<boolean>(false)

   useEffect(() => {
      const fetchData = async () => {
         setLoading(true)
         try {
            const response = await fetch(`http://localhost:8080/api/stockkeeper/export-warehouse/admin?page=${query.page}&limit=${query.limit}`, {
               method: "GET",
               headers: {
                  Authorization: `Bearer ${Cookies.get("token")}`,
               },
            })
            if (response.ok) {
               const result = await response.json()
               console.log("result:" + result.data);              
               setData(result.data);
               console.log("data:" + data)
               setTotal(result.total)
            } else {
               message.error("Không thể tải dữ liệu")
            }
         } catch (error) {
            message.error("Có lỗi xảy ra khi tải dữ liệu")
         } finally {
            setLoading(false)
         }
      }
      fetchData()      
   }, [query.page, query.limit])

   const handleStatusChange = async (ticketId: string, isAccept: boolean) => {
      try {
         const url = `http://localhost:8080/api/stockkeeper/export-warehouse/admin/${ticketId}/${isAccept}`;
   
         
         const response = await fetch(url, {
            method: "PUT",
            headers: {
               accept: "*/*",
               Authorization: `Bearer ${Cookies.get("token")}`,
            },
         });
   
         if (!response.ok) {
            throw new Error("Cập nhật trạng thái thất bại");
         }
   
         const data = await response.json();
         message.success(data.message || "Cập nhật trạng thái thành công");
         window.location.reload();
         setQuery((prev) => ({ ...prev, page:1 }));
      } catch (error) {
         message.error("Có lỗi xảy ra khi cập nhật trạng thái");
      }
   };
   

   return (
      <PageContainer
         title="Danh sách Yêu cầu"
         className="custom-pagecontainer-admin"
         fixedHeader={true}
      >
         <ProTable<RequestDto>
            dataSource={data} 
            loading={loading}
            pagination={{
               pageSize: query.limit,
               current: query.page, 
               total: total, 
               onChange: (page, pageSize) => {
                  setQuery((prev) => ({
                     ...prev,
                     page,
                     limit: pageSize,
                  }))
               },
            }}
            columns={[
               {
                  title: "ID",
                  dataIndex: "id",
               },
               {
                  title: "Trạng thái",
                  dataIndex: "status",            
               },
               {
                  title: "Loại xuất khẩu",
                  dataIndex: "export_type",
               },
               {
                  title: "Ngày tạo",
                  dataIndex: "createdAt",
                  render: (_, entity) => dayjs(entity.createdAt).format("DD/MM/YYYY HH:mm"),
               },
               {
                  title: "Ngày cập nhật",
                  dataIndex: "updatedAt",
                  render: (_, entity) => dayjs(entity.updatedAt).format("DD/MM/YYYY HH:mm"),
               },
               {
                  title: "Thao tác",
                  render: (_, entity) => (
                     <div className={"flex items-center justify-end gap-2"}>
                        <Button
                           type={"text"}
                           icon={<CheckOutlined />}
                           onClick={() => handleStatusChange(entity.id, true)}
                        >
                           Chấp nhận
                        </Button>
                        <Button
                           type={"text"}
                           icon={<CloseOutlined />}
                           onClick={() => handleStatusChange(entity.id, false)}
                        >
                           Từ chối
                        </Button>
                     </div>
                  ),
               },
            ]}
         />
      </PageContainer>
   )
}

export default RequestsPage