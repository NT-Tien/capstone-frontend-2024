import { ReactNode, useState } from "react"
import useModalControls from "@/common/hooks/useModalControls"
import { App, Button, Drawer, Form, Typography, Upload } from "antd"
import { ProFormItem, ProFormTextArea } from "@ant-design/pro-components"
import ImageWithCrop from "@/common/components/ImageWithCrop"
import { RcFile, UploadFile } from "antd/es/upload"
import { File_Image_Upload } from "@/_api/file/upload_image.api"
import Cookies from "js-cookie"
import checkImageUrl from "@/common/util/checkImageUrl.util"
import { File_Video_Upload } from "@/_api/file/upload_video.api"
import { useMutation } from "@tanstack/react-query"
import Staff_Issue_UpdateFinish from "@/app/staff/_api/issue/update-finish"

type SubmitFieldType = {
   imagesVerify: UploadFile
   videosVerify: UploadFile
}

type Props = {
   onFinish: () => void
}

export default function FinishIssueDrawer({
   children,
   ...props
}: {
   children: (handleOpen: (issueId: string) => void) => ReactNode
} & Props) {
   const { message } = App.useApp()
   const [form] = Form.useForm<SubmitFieldType>()

   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (issueId: string) => {
         setIssueId(issueId)
      },
      onClose: () => {
         setTimeout(() => {
            form.resetFields()
            setIssueId(undefined)
         }, 200)
      },
   })

   const [loadingImage, setLoadingImage] = useState(false)
   const [issueId, setIssueId] = useState<string | undefined>(undefined)

   const mutate_resolveIssue = useMutation({
      mutationFn: Staff_Issue_UpdateFinish,
      onMutate: async () => {
         message.open({
            type: "loading",
            content: `Chờ đợi...`,
            key: `loading`,
         })
      },
      onError: async (error) => {
         message.error({
            content: "Đã xảy ra lỗi khi hoàn thành vấn đề.",
         })
      },
      onSuccess: async () => {
         message.success({
            content: `Hoàn thành
            vấn đề thành công.`,
         })
      },
      onSettled: () => {
         message.destroy(`loading`)
      },
   })

   function handleSubmit(values: SubmitFieldType) {
      if (!issueId) return

      mutate_resolveIssue.mutate(
         {
            id: issueId!,
            payload: {
               imagesVerify: [values.imagesVerify.response],
               videosVerify: values.videosVerify?.response ?? "",
            },
         },
         {
            onSuccess: () => {
               handleClose()
               setTimeout(() => {
                  props.onFinish()
               }, 300)
            },
         },
      )
   }

   return (
      <>
         {children(handleOpen)}

         <Drawer title="Hoàn thành lỗi" open={open} onClose={handleClose} placement="bottom" height="max-content">
            <Form<SubmitFieldType>
               form={form}
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
            </Form>
            <section className="mt-3">
               <Button
                  type="primary"
                  size="large"
                  className="w-full"
                  onClick={() => handleSubmit(form.getFieldsValue())}
               >
                  Xác nhận thành công
               </Button>
            </section>
         </Drawer>
      </>
   )
}
