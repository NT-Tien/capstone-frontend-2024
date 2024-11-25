"use client"

import AlertCard from "@/components/AlertCard"
import { DownloadOutlined, InboxOutlined } from "@ant-design/icons"
import { PageContainer } from "@ant-design/pro-components"
import { App, Button, Card, Modal, Upload, UploadFile } from "antd"
import { UploadChangeParam } from "antd/es/upload"
import { useMemo, useState } from "react"
import Spreadsheet, { CellBase, Matrix } from "react-spreadsheet"
import * as xlsx from "xlsx"
import { useMutation, useQuery } from "@tanstack/react-query"
import { stockkeeper_qk } from "@/features/stockkeeper/api/qk"
import Stockkeeper_Model_UpdateMany from "@/features/stockkeeper/api/machine-model/update-many-model.api"
import Stockkeeper_MachineModel_All from "@/features/stockkeeper/api/machine-model/getAll.api"
import { ChartLineUp, Keyboard } from "@phosphor-icons/react"
import CountUp from "react-countup"
import { useRouter } from "next/navigation"

type UploadFileResult = {
   "Mã mẫu máy": string
   "Tên mẫu máy": string
   "Miêu tả": string
   "Số lượng nhập": number
}

function Page() {
   const { notification, modal, message } = App.useApp()
   const router = useRouter()

   const [uploadJson, setUploadJson] = useState<UploadFileResult[] | null>(null)

   const api_allMachineModels = useQuery({
      queryKey: stockkeeper_qk.machineModel.all,
      queryFn: () => Stockkeeper_MachineModel_All({ page: 1, limit: 5000 }),
   })

   const mutate_updateMany = useMutation({
      mutationFn: Stockkeeper_Model_UpdateMany,
      onMutate: () => {
         message.loading({
            content: "Đang xử lý...",
            key: "updateMany",
         })
      },
      onSuccess: () => {
         message.success({
            content: "Cập nhật thành công",
         })
      },
      onError: () => {
         message.error({
            content: "Có lỗi xảy ra",
         })
      },
      onSettled: () => {
         message.destroy("updateMany")
      },
   })

   function handleCustomDownload() {
      if (!api_allMachineModels.isSuccess) return

      const wb = xlsx.utils.book_new()
      const ws = xlsx.utils.json_to_sheet(
         api_allMachineModels.data.list.map((item) => ({
            "Mã mẫu máy": item.id,
            "Tên mẫu máy": item.name,
            "Miêu tả": item.description || "",
            "Số lượng nhập": 0,
         }))
      )
      xlsx.utils.book_append_sheet(wb, ws, "Sheet1")

      const wbout = xlsx.write(wb, { bookType: "xlsx", type: "array" })
      const blob = new Blob([wbout], { type: "application/octet-stream" })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "mau_nhap_mau_may.xlsx"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
   }

   function handleUpload(info: UploadChangeParam<UploadFile<any>>) {
      const file = info.fileList[0]?.originFileObj;
      if (!file) return;
   
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
   
      fileReader.onload = (e) => {
         const bufferArray = e.target?.result;
   
         if (!bufferArray) {
            notification.error({
               message: "Lỗi đọc file",
               description: "Không thể đọc file, vui lòng thử lại.",
            });
            return;
         }
   
         const wb = xlsx.read(bufferArray, { type: "buffer" });
         const wsname = wb.SheetNames[0];
         const ws = wb.Sheets[wsname];
   
         const data: any[] = xlsx.utils.sheet_to_json(ws);
   
         const parsedData = (data as UploadFileResult[]).filter((item) => {
            const quantity =item["Số lượng nhập"];
            return !isNaN(quantity) && quantity > 0;
         });
   
         if (parsedData.length === 0) {
            notification.warning({
               message: "Không có dữ liệu hợp lệ",
               description: "Không có dòng nào có 'Số lượng nhập' lớn hơn 0.",
            });
         } else {
            setUploadJson(parsedData);
         }
      };
   
      fileReader.onerror = () => {
         notification.error({
            message: "Lỗi đọc file",
            description: "Không thể đọc file, vui lòng thử lại.",
         });
      };
   }

   function handleCancelModal() {
      modal.confirm({
         title: "Hủy bỏ",
         content: "Bạn có chắc chắn muốn hủy bỏ việc tải lên?",
         onOk: () => setUploadJson(null),
      })
   }

   function handleUpdateMany(data: UploadFileResult[]) {
      if (!data || data.length === 0) {
         message.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
         return;
      }
   
      const payload = {
         model: data.map((item) => ({
            machineModelCode: item["Mã mẫu máy"],
            modelName: item["Tên mẫu máy"],
            description: item["Miêu tả"],
            quantity: item["Số lượng nhập"],
         })),
      };
   
      mutate_updateMany.mutate(payload, {
         onSuccess: () => {
            setUploadJson(null); 
            router.push("/stockkeeper/desktop/machine-models");
         },
      });
   }
   

   const matrixData = useMemo(() => {
      if (!uploadJson) return []
      return uploadJson.map((item) => [
         { value: item["Mã mẫu máy"] },
         { value: item["Tên mẫu máy"] },
         { value: item["Miêu tả"] },
         { value: item["Số lượng nhập"] },
      ]) satisfies Matrix<CellBase<string | number>>
   }, [uploadJson])

   return (
      <PageContainer
         title="Nhập mẫu máy vào kho"
         content={
            <AlertCard
               text="Hãy sử dụng các biểu mẫu được cung cấp để cập nhật mẫu máy nhanh chóng hơn."
               type="info"
            />
         }
      >
         <div className="space-y-2">
            <Card title="1. Tải về và điền thông tin vào mẫu">
               <Button type="primary" icon={<DownloadOutlined />} onClick={handleCustomDownload}>
                  Tải về mẫu
               </Button>
            </Card>
            <Card title="2. Tải lên mẫu điền đã hoàn tất">
               <Upload.Dragger
                  maxCount={1}
                  onChange={handleUpload}
                  accept=".xlsx, .xls"
                  beforeUpload={() => false}
                  showUploadList={false}
               >
                  <p className="ant-upload-drag-icon">
                     <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Vui lòng kéo thả hoặc nhấn vào đây để tải lên file Excel</p>
                  <p className="ant-upload-hint">Chỉ chấp nhận file Excel (.xlsx, .xls)</p>
               </Upload.Dragger>
            </Card>
         </div>
         <Modal
            open={!!uploadJson}
            onCancel={handleCancelModal}
            centered
            title="Tải mẫu máy"
            width="50%"
            okButtonProps={{
               disabled: !uploadJson,
            }}
            okText="Cập nhật"
            onOk={() =>
               modal.confirm({
                  title: "Xác nhận cập nhật",
                  content: "Bạn có chắc chắn muốn cập nhật thông tin mẫu máy?",
                  onOk: () => uploadJson && handleUpdateMany(uploadJson),
               })
            }
         >
            {uploadJson && (
               <>
                  <section className="mb-3 flex gap-3">
                     <Card size="small">
                        <h5 className="text-xs text-neutral-500">SỐ LOẠI MẪU MÁY</h5>
                        <CountUp className="text-lg font-bold" end={uploadJson.length} duration={1} />
                     </Card>
                     <Card size="small">
                        <h5 className="text-xs text-neutral-500">SỐ MẪU MÁY NHẬP</h5>
                        <CountUp
                           className="text-lg font-bold"
                           end={uploadJson.reduce((acc, item) => acc + item["Số lượng nhập"], 0)}
                           duration={1}
                        />
                     </Card>
                  </section>
                  <Spreadsheet
                     columnLabels={["Mã mẫu máy", "Tên mẫu máy", "Miêu tả", "Số lượng nhập"]}
                     data={matrixData}
                     className="spreadsheet-w-full"
                  />
               </>
            )}
         </Modal>
      </PageContainer>
   )
}

export default Page
