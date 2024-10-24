"use client"

import { useQueryClient } from "@tanstack/react-query"
import { stockkeeper_qk } from "@/features/stockkeeper/api/qk"
import Stockkeeper_SparePart_All from "@/features/stockkeeper/api/spare-part/all.api"
import * as xlsx from "xlsx"
import { App } from "antd"

function useDownloadImportSpareParts() {
   const queryClient = useQueryClient()
   const { message } = App.useApp()

   async function handleDownload() {
      try {
         message.destroy("download")
         message.loading({ content: "Đang tải file mẫu...", key: "download" })

         const spareParts = await queryClient.ensureQueryData({
            queryKey: stockkeeper_qk.sparePart.all({ page: 1, limit: 5000 }),
            queryFn: () => Stockkeeper_SparePart_All({ page: 1, limit: 5000 }),
         })

         const wb = xlsx.utils.book_new()
         const ws = xlsx.utils.json_to_sheet(
            spareParts.list.map((item) => ({
               "Mã linh kiện": item.id,
               "Tên linh kiện": item.name,
               "Tên mẫu máy": item.machineModel.name,
               "Số lượng nhập": 0,
            })),
         )
         xlsx.utils.book_append_sheet(wb, ws, "Sheet1")

         const wbout = xlsx.write(wb, { bookType: "xlsx", type: "array" })
         const blob = new Blob([wbout], { type: "application/octet-stream" })

         message.success({ content: "Tải file mẫu thành công", key: "download" })

         const url = URL.createObjectURL(blob)
         const a = document.createElement("a")
         a.href = url
         a.download = "mau_nhap_linh_kien_day_du.xlsx"
         window.document.body.appendChild(a)
         a.click()
         window.document.body.removeChild(a)
         URL.revokeObjectURL(url)
      } catch (error) {
         console.error(error)
         message.error("Lỗi khi tải xuống file mẫu")
      }
   }

   return { handleDownload }
}

export default useDownloadImportSpareParts
