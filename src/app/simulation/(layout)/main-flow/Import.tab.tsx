import { useMutation, useQuery } from "@tanstack/react-query"
import { stockkeeper_qk } from "@/features/stockkeeper/api/qk"
import Stockkeeper_SparePart_AllAddMore from "@/features/stockkeeper/api/spare-part/all-addmore"
import AuthTokens from "@/lib/constants/AuthTokens"
import * as xlsx from "xlsx"
import { UploadChangeParam } from "antd/es/upload"
import { Button, Card, Modal, Upload, UploadFile } from "antd"
import { mau_nhap_linh_kien_1_validator } from "@/features/stockkeeper/validators/mau_nhap_linh_kien_1.validator"
import App from "antd/es/app"
import { useMemo, useState } from "react"
import Stockkeeper_SparePart_UpdateMany from "@/features/stockkeeper/api/spare-part/update-many.api"
import { DownloadOutlined, InboxOutlined } from "@ant-design/icons"
import CountUp from "react-countup"
import { ChartLineUp, Keyboard } from "@phosphor-icons/react"
import Spreadsheet, { CellBase, Matrix } from "react-spreadsheet"

type UploadFileResult = {
   "Mã linh kiện": string
   "Tên linh kiện": string
   "Tên mẫu máy": string
   "Số lượng nhập": number
}

function ImportTab() {
   const { notification, modal, message } = App.useApp()
   const [uploadJson, setUploadJson] = useState<UploadFileResult[] | null>(null)

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

   const api_missingSpareParts = useQuery({
      queryKey: stockkeeper_qk.sparePart.allNeedMore(),
      queryFn: () =>
         Stockkeeper_SparePart_AllAddMore({
            token: AuthTokens.Stockkeeper,
         }),
      select: (data) => {
         return Object.values(data)
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
            "Số lượng nhập": item.quantityNeedToAdd,
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

         const parsedData = (data as UploadFileResult[]).filter((item) => item["Số lượng nhập"] > 0)
         setUploadJson(parsedData)
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
            token: AuthTokens.Stockkeeper,
         },
         {
            onSuccess: () => {
               setUploadJson(null)
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
      <div className="flex flex-col gap-3">
         <Card title="1. Tải về và điền thông tin vào mẫu">
            <Button
               className="mt-layout"
               download="gia_lap_mau_nhap_linh_kien_1.xlsx"
               type="primary"
               icon={<DownloadOutlined />}
               onClick={handleCustomDownload}
            >
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
               <p className="ant-upload-text">
                  Vui lòng kéo thả hoặc nhấn vào đây để tải lên file Excel chứa thông tin linh kiện
               </p>
               <p className="ant-upload-hint">Chỉ chấp nhận file Excel (.xlsx, .xls) theo mẫu đã tải về</p>
            </Upload.Dragger>
         </Card>
         <Modal
            open={!!uploadJson}
            onCancel={handleCancelModal}
            centered
            title="Tải linh kiện"
            width="50%"
            okButtonProps={{
               disabled: !uploadJson,
               loading: mutate_updateMany.isPending,
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
                              <h5 className="text-xs text-neutral-500">SỐ LOẠI LINH KIỆN</h5>
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
      </div>
   )
}

export default ImportTab
