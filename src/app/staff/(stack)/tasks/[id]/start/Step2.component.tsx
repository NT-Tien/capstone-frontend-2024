import { RcFile, UploadFile } from "antd/es/upload"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { App, Button, Card, Drawer, Form, Popconfirm, Result, Typography, Upload } from "antd"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Staff_Task_UpdateFinish from "@/app/staff/_api/task/update-finish.api"
import staff_qk from "@/app/staff/_api/qk"
import { ProFormItem, ProFormTextArea } from "@ant-design/pro-components"
import ImageWithCrop from "@/common/components/ImageWithCrop"
import { File_Image_Upload } from "@/_api/file/upload_image.api"
import Cookies from "js-cookie"
import checkImageUrl from "@/common/util/checkImageUrl.util"
import { File_Video_Upload } from "@/_api/file/upload_video.api"
import { HomeOutlined } from "@ant-design/icons"
import { GeneralProps } from "@/app/staff/(stack)/tasks/[id]/start/page"

type SubmitFieldType = {
   fixerNote: string
   imagesVerify: UploadFile
   videosVerify: UploadFile
}

type Step3Props = GeneralProps & {
   id: string
}

export default function Step2(props: Step3Props) {
   const router = useRouter()
   const [loadingImage, setLoadingImage] = useState(false)
   const { message } = App.useApp()
   const [form] = Form.useForm<SubmitFieldType>()
   const queryClient = useQueryClient()
   const [open, setOpen] = useState(false)

   const mutate_finishTask = useMutation({
      mutationFn: Staff_Task_UpdateFinish,
      onMutate: async () => {
         message.open({
            type: "loading",
            content: `Loading...`,
            key: `loading`,
         })
      },
      onError: async (error) => {
         message.error({
            content: "An error occurred. Please try again later.",
         })
      },
      onSuccess: async () => {
         message.success({
            content: `Spare parts received successfully.`,
         })
         await queryClient.invalidateQueries({
            queryKey: staff_qk.task.one_byId(props.id),
         })
      },
      onSettled: () => {
         message.destroy(`loading`)
      },
   })

   function handleSubmit(values: SubmitFieldType) {
      console.log("SUBMIT", values)
      mutate_finishTask.mutate(
         {
            id: props.id,
            payload: {
               imagesVerify: [values.imagesVerify.response],
               videosVerify: values.videosVerify?.response ?? "",
               fixerNote: values.fixerNote,
            },
         },
         {
            onSuccess: () => {
               setOpen(true)
            },
         },
      )
   }

   return (
      <div style={props.style}>
         <Card size="small" className="mt-layout">
            Bạn đã sửa chữa thành công tất cả các vấn đề trong tác vụ này. Vui lòng chụp ảnh và quay video chứng minh
            việc sửa chữa để hoàn tất tác vụ!
         </Card>
         <Form<SubmitFieldType>
            form={form}
            className="mt-3"
            onValuesChange={(values) => {
               console.log(values, typeof values.imagesVerify?.[0])
            }}
         >
            <ProFormItem
               name="imagesVerify"
               label="Hình ảnh xác nhận"
               shouldUpdate
               rules={[{ required: true, message: "Vui lòng cập nhật hình ảnh" }]}
            >
               <ImageWithCrop
                  name="image"
                  accept=".jpg,.jpeg,.png,.gif,.bmp,.svg,.webp"
                  customRequest={async (props) => {
                     const file = props.file as RcFile
                     const response = await File_Image_Upload({ file })
                     if (response.status === 201) props.onSuccess?.(response.data.path)
                     else props.onError?.(new Error("Failed to upload file."), response)
                  }}
                  showUploadList={true}
                  listType="picture"
                  multiple={false}
                  maxCount={1}
                  method="POST"
                  headers={{
                     Authorization: `Bearer ${Cookies.get("token")}`,
                  }}
                  isImageUrl={checkImageUrl}
                  className="w-full"
                  onChange={(info) => {
                     setLoadingImage(false)
                     if (info.file.status === "done") {
                        form.setFieldsValue({ imagesVerify: info.file })
                     }
                     if (info.file.status === "uploading") {
                        setLoadingImage(true)
                     }
                     if (info.file.status === "error") {
                        message.error("Tải tệp thất bại")
                     }
                     if (info.file.status === "removed") {
                        form.setFieldsValue({ imagesVerify: {} })
                        message.success("Tệp đã bị xóa")
                     }
                  }}
               >
                  <div className="flex flex-col items-center justify-center">
                     <Typography.Title level={5}>Nhấp vào đây</Typography.Title>
                     <p>Vui lòng tải hình ảnh lên.</p>
                  </div>
               </ImageWithCrop>
            </ProFormItem>
            <ProFormItem name="videosVerify" label="Video xác nhận" shouldUpdate>
               <Upload.Dragger
                  accept=".mp4,.avi,.flv,.wmv,.mov,.webm,.mkv,.3gp,.3g2,.m4v,.mpg,.mpeg,.m2v,.m4v,.3gp,.3g2,.m4v,.mpg,.mpeg,.m2v,.m4v"
                  customRequest={async (props) => {
                     const file = props.file as RcFile
                     const response = await File_Video_Upload({ file })
                     if (response.status === 201) props.onSuccess?.(response.data.path)
                     else props.onError?.(new Error("Failed to upload file."), response)
                  }}
                  showUploadList={true}
                  listType="picture"
                  multiple={false}
                  maxCount={1}
                  method="POST"
                  className="w-full"
                  onChange={(info) => {
                     setLoadingImage(false)
                     if (info.file.status === "done") {
                        form.setFieldsValue({ videosVerify: info.file })
                     }
                     if (info.file.status === "uploading") {
                        setLoadingImage(true)
                     }
                     if (info.file.status === "error") {
                        message.error("Tải tệp thất bại")
                     }
                     if (info.file.status === "removed") {
                        form.setFieldsValue({ videosVerify: {} })
                        message.success("Tệp đã bị xóa")
                     }
                  }}
               >
                  <div className="flex flex-col items-center justify-center">
                     <Typography.Title level={5}>Nhấp vào đây</Typography.Title>
                     <p>Vui lòng tải video lên.</p>
                  </div>
               </Upload.Dragger>
            </ProFormItem>
            <ProFormTextArea
               label="Ghi chú"
               name="fixerNote"
               fieldProps={{
                  placeholder: "Thêm ghi chú",
               }}
            />
         </Form>
         <div className="fixed bottom-0 left-0 flex w-full gap-3 bg-white p-layout">
            <Button
               icon={<HomeOutlined />}
               size="large"
               className="aspect-square w-16"
               onClick={() => {
                  router.push("/staff/dashboard")
               }}
            />
            <Button
               size="large"
               className="w-52"
               onClick={() => {
                  props.handleBack?.()
               }}
            >
               Quay lại
            </Button>
            <Popconfirm
               title="Lưu ý"
               description="Bạn có chắc chắn hoàn thành tác vụ này không?"
               onConfirm={() => {
                  handleSubmit(form.getFieldsValue())
               }}
               okText="Có"
               cancelText="Không"
            >
               <Button size="large" type="primary" className="w-full">
                  Hoàn thành tác vụ
               </Button>
            </Popconfirm>
         </div>
         <Drawer open={open} onClose={() => setOpen(false)} placement="bottom" height="100%" closeIcon={null}>
            <div className="grid h-full w-full place-content-center">
               <Result
                  title="Bạn đã hoàn thành tác vụ"
                  status="success"
                  subTitle={"Cảm ơn bạn đã hoàn thành tác vụ. Vui lòng chờ xác nhận từ quản lý."}
                  extra={
                     <Button
                        type="primary"
                        onClick={() => {
                           router.push("/staff/dashboard")
                        }}
                     >
                        Quay lại trang chính
                     </Button>
                  }
               />
            </div>
         </Drawer>
      </div>
   )
}
