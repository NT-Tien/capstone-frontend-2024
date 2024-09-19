"use client"

import AlertCard from "@/components/AlertCard"
import { DownloadOutlined, InboxOutlined } from "@ant-design/icons"
import { PageContainer, ProTable } from "@ant-design/pro-components"
import { App, Button, Card, Modal, Radio, Table, Upload, UploadFile } from "antd"
import { UploadChangeParam } from "antd/es/upload"
import { useMemo, useState } from "react"
import Spreadsheet, { CellBase, Matrix } from "react-spreadsheet"
import * as xlsx from "xlsx"
import { mau_nhap_linh_kien_1_validator } from "./_validators/mau_nhap_linh_kien_1.validator"
import { useMutation, useQuery } from "@tanstack/react-query"
import { stockkeeper_qk } from "@/app/stockkeeper/_api/qk"
import Stockkeeper_SparePart_AllAddMore from "@/app/stockkeeper/_api/spare-part/all-addmore"
import { ChartLineUp, Keyboard } from "@phosphor-icons/react"
import CountUp from "react-countup"
import Stockkeeper_SparePart_UpdateMany from "@/app/stockkeeper/_api/spare-part/update-many.api"
import { useRouter } from "next/navigation"

type UploadFileResult = {
   "Mã linh kiện": string
   "Tên linh kiện": string
   "Tên mẫu máy": string
   "Số lượng nhập": number
}

function Page({ searchParams }: { searchParams: { from?: "missing" } }) {
   const { notification, modal, message } = App.useApp()
   const router = useRouter()

   const [uploadJson, setUploadJson] = useState<UploadFileResult[] | null>(null)
   const [selectedDownload, setSelectedDownload] = useState<"empty" | "filled">(
      searchParams.from === "missing" ? "filled" : "empty",
   )

   const api_missingSpareParts = useQuery({
      queryKey: stockkeeper_qk.sparePart.allNeedMore(),
      queryFn: Stockkeeper_SparePart_AllAddMore,
      select: (data) => {
         return Object.values(data)
      },
      enabled: selectedDownload === "filled",
   })

   const mutate_updateMany = useMutation({
      mutationFn: Stockkeeper_SparePart_UpdateMany,
      onMutate: (req) => {
         message.loading({
            content: "Đang xử lý...",
            key: "updateMany",
         })
      },
      onSuccess: (data) => {
         message.success({
            content: "Cập nhật thành công",
         })
      },
      onError: (error) => {
         message.error({
            content: "Có lỗi xảy ra",
         })
      },
      onSettled: () => {
         message.destroy("updateMany")
      },
   })

   function handleCustomDownload() {
      if (!api_missingSpareParts.isSuccess) return

      const wb = xlsx.utils.book_new()
      const ws = xlsx.utils.json_to_sheet(
         api_missingSpareParts.data.map((item) => ({
            "Mã linh kiện": item.sparePart.id,
            "Tên linh kiện": item.sparePart.name,
            "Tên mẫu máy": item.sparePart.machineModel.name,
            "Số lượng nhập": 0,
         })),
      )
      xlsx.utils.book_append_sheet(wb, ws, "Sheet1")

      const wbout = xlsx.write(wb, { bookType: "xlsx", type: "array" })
      const blob = new Blob([wbout], { type: "application/octet-stream" })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "mau_nhap_linh_kien_day_du.xlsx"
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      URL.revokeObjectURL(url)
   }

   function handleUpload(info: UploadChangeParam<UploadFile<any>>) {
      const file = info.fileList[0]?.originFileObj
      if (!file) {
         return
      }

      const fileReader = new FileReader()
      fileReader.readAsArrayBuffer(file)
      fileReader.onload = (e) => {
         const bufferArray = e.target?.result
         const wb = xlsx.read(bufferArray, { type: "buffer" })
         const wsname = wb.SheetNames[0]
         const ws = wb.Sheets[wsname]
         const data: any = xlsx.utils.sheet_to_json(ws)
         const validationResult = mau_nhap_linh_kien_1_validator.validate(data)
         if (!validationResult) {
            notification.error({
               message: "File không hợp lệ",
               description: "Vui lòng kiểm tra lại file mẫu và thử lại",
            })
            return
         }

         setUploadJson(data)
      }
      fileReader.onerror = (e) => {
         console.log(e)
      }
   }

   function handleCancelModal() {
      modal.confirm({
         title: "Hủy bỏ",
         content: "Bạn có chắc chắn muốn hủy bỏ việc tải lên?",
         centered: true,
         closable: true,
         maskClosable: true,
         onOk: () => {
            setUploadJson(null)
         },
      })
   }

   function handleUpdateMany(data: UploadFileResult[]) {
      console.log(
         data.map((item) => ({
            sparePartName: item["Tên linh kiện"],
            quantity: item["Số lượng nhập"],
            machineModelName: item["Tên mẫu máy"],
         })),
      )
      mutate_updateMany.mutate(
         {
            spareParts: data.map((item) => ({
               sparePartName: item["Tên linh kiện"],
               quantity: item["Số lượng nhập"],
               machineModelName: item["Tên mẫu máy"],
            })),
         },
         {
            onSuccess: () => {
               setUploadJson(null)
               router.push("/stockkeeper/desktop/spare-parts")
            },
         },
      )
   }

   const matrixData = useMemo(() => {
      if (!uploadJson) {
         return []
      }

      return uploadJson.map((item) => [
         { value: item["Mã linh kiện"] },
         { value: item["Tên linh kiện"] },
         { value: item["Tên mẫu máy"] },
         { value: item["Số lượng nhập"] },
      ]) satisfies Matrix<CellBase<string | number>>
   }, [uploadJson])

   return (
      <PageContainer
         title="Nhập linh kiện vào kho"
         content={
            <AlertCard
               text="Chào mừng bạn đến với trang Đăng tải hàng loạt linh kiện. Hãy sử dụng các biểu mẫu được cung cấp để cập nhật linh kiện nhanh chóng hơn."
               type="info"
            />
         }
      >
         <div className="space-y-2">
            <Card title="1. Tải về và điền thông tin vào mẫu">
               <Radio.Group
                  className="mb-3 flex items-center gap-4"
                  value={selectedDownload}
                  onChange={(e) => setSelectedDownload(e.target.value as any)}
               >
                  <Card
                     className="w-full cursor-pointer select-none"
                     hoverable
                     onClick={() => setSelectedDownload("empty")}
                  >
                     <div className="flex items-start gap-1">
                        <Radio value={"empty"}></Radio>
                        <div>
                           <h3 className="text-lg font-medium">Mẫu điền trống</h3>
                           <div className="text-base font-light">Bao gồm thông tin bắt buộc để cập nhật linh kiện</div>
                        </div>
                     </div>
                  </Card>
                  <Card
                     className="w-full cursor-pointer select-none"
                     hoverable
                     onClick={() => setSelectedDownload("filled")}
                  >
                     <div className="flex items-start gap-1">
                        <Radio value="filled"></Radio>
                        <div>
                           <h3 className="text-lg font-medium">Mẫu điền đầy đủ</h3>
                           <div className="text-base font-light">
                              Bao gồm cả thông tin bắt buộc và các linh kiện hiện tại đang hết hàng
                           </div>
                        </div>
                     </div>
                  </Card>
               </Radio.Group>
               {selectedDownload === "empty" && (
                  <Button
                     className="mt-layout"
                     download="mau_nhap_linh_kien_1.xlsx"
                     type="primary"
                     icon={<DownloadOutlined />}
                     href="/files/mau_nhap_linh_kien_1.xlsx"
                  >
                     Tải về mẫu
                  </Button>
               )}
               {selectedDownload === "filled" && (
                  <section>
                     <ProTable
                        headerTitle="Danh sách linh kiện cần thêm"
                        dataSource={api_missingSpareParts.data}
                        loading={api_missingSpareParts.isPending}
                        search={false}
                        cardProps={{ bodyStyle: { padding: 0 } }}
                        scroll={{
                           x: "max-content",
                        }}
                        pagination={{
                           pageSize: 5,
                        }}
                        columns={[
                           {
                              title: "STT",
                              dataIndex: "index",
                              valueType: "indexBorder",
                              width: 48,
                              align: "center",
                           },
                           {
                              dataIndex: ["sparePart", "name"],
                              title: "Tên linh kiện",
                              width: 400,
                              ellipsis: true,
                              render: (_, e) => <a>{e.sparePart.name}</a>,
                           },
                           {
                              dataIndex: ["sparePart", "machineModel", "name"],
                              title: "Mẫu máy",
                              width: 400,
                              ellipsis: true,
                           },
                           {
                              dataIndex: ["sparePart", "quantity"],
                              title: "Số lượng trong kho",
                              render: (_, e) => <span className="text-red-500">{e.sparePart.quantity}</span>,
                           },
                           {
                              dataIndex: ["quantityNeedToAdd"],
                              title: "Số lượng được yêu cầu",
                              render: (_, e) => <span className="text-green-500">{e.quantityNeedToAdd}</span>,
                           },
                        ]}
                     />
                     <div className="mt-layout">
                        <Button type="primary" icon={<DownloadOutlined />} onClick={handleCustomDownload}>
                           Tải về mẫu *
                        </Button>
                        <div className="mt-3 text-sm text-red-400">
                           * Các linh kiện trên sẽ được tự động điền vào mẫu khi tải về
                        </div>
                     </div>
                  </section>
               )}
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
                  <p className="ant-upload-text">Click or drag file to this area to upload</p>
                  <p className="ant-upload-hint">
                     Support for a single or bulk upload. Strictly prohibited from uploading company data or other
                     banned files.
                  </p>
               </Upload.Dragger>
            </Card>
         </div>
         <Modal
            open={!!uploadJson}
            onCancel={handleCancelModal}
            centered
            title="Tải linh kiện"
            width="50%"
            okButtonProps={{
               disabled: !uploadJson,
            }}
            okText="Cập nhật"
            onOk={() =>
               modal.confirm({
                  title: "Xác nhận cập nhật",
                  content: "Bạn có chắc chắn muốn cập nhật thông tin linh kiện?",
                  centered: true,
                  closable: true,
                  maskClosable: true,
                  okButtonProps: {
                     disabled: !uploadJson,
                  },
                  onOk: () => uploadJson && handleUpdateMany(uploadJson),
               })
            }
         >
            {uploadJson && (
               <>
                  <section className="mb-3 flex gap-3">
                     <Card size="small">
                        <div className="flex justify-between gap-10">
                           <div>
                              <h5 className="text-xs text-neutral-500">TỔNG SỐ LINH KIỆN</h5>
                              <CountUp
                                 className="text-lg font-bold"
                                 end={uploadJson.length}
                                 duration={1}
                                 separator={","}
                              />
                           </div>
                           <div className="aspect-square h-full rounded-full bg-red-500 p-2">
                              <ChartLineUp size={28} className="text-white" weight="fill" />
                           </div>
                        </div>
                     </Card>
                     <Card size="small">
                        <div className="flex justify-between gap-10">
                           <div>
                              <h5 className="text-xs text-neutral-500">SỐ LINH KIỆN NHẬP</h5>
                              <div>
                                 <CountUp
                                    className="text-lg font-bold"
                                    end={uploadJson.reduce((acc, item) => acc + item["Số lượng nhập"], 0)}
                                    duration={1}
                                    separator={","}
                                 />
                              </div>
                           </div>
                           <div className="aspect-square h-full rounded-full bg-blue-500 p-2">
                              <Keyboard size={28} className="text-white" weight="fill" />
                           </div>
                        </div>
                     </Card>
                  </section>
                  <Spreadsheet
                     columnLabels={["Mã linh kiện", "Tên linh kiện", "Tên mẫu máy", "Số lượng nhập"]}
                     data={matrixData}
                     className="spreadsheet-w-full max-h-[50vh] w-full overflow-y-auto"
                  />
               </>
            )}
         </Modal>
      </PageContainer>
   )
}

export default Page
