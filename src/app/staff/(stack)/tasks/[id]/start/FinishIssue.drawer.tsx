import { ReactNode, useMemo, useState } from "react"
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
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { SendWarrantyTypeErrorId } from "@/constants/Warranty"

type SubmitFieldType = {
   imagesVerify?: UploadFile[]
   videosVerify?: UploadFile
}

type Props = {
   onFinish: () => void
}

export default function FinishIssueDrawer({
   children,
   ...props
}: {
   children: (handleOpen: (issue: FixRequestIssueDto) => void) => ReactNode
} & Props) {
   const { message } = App.useApp()
   const [form] = Form.useForm<SubmitFieldType>()

   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (issue: FixRequestIssueDto) => {
         setIssue(issue)
      },
      onClose: () => {
         setTimeout(() => {
            form.resetFields()
            setIssue(undefined)
         }, 200)
      },
   })

   const [loadingImage, setLoadingImage] = useState(false)
   const [issue, setIssue] = useState<FixRequestIssueDto | undefined>(undefined)

   const isWarrantyIssue = useMemo(() => {
      return issue?.typeError.id === SendWarrantyTypeErrorId
   }, [issue])

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
      if (!issue) return

      if(isWarrantyIssue) {
         if(!values.imagesVerify || values.imagesVerify.length === 0) {
            message.error("Vui lòng tải ảnh lên.")
            return
         }
      }

      mutate_resolveIssue.mutate(
         {
            id: issue.id,
            payload: {
               imagesVerify: values.imagesVerify?.map((file) => file.response) ?? [""],
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
               initialValues={{
                  imagesVerify: [],
               }}
            >
               <ProFormItem
                  name="imagesVerify"
                  label={isWarrantyIssue ? "Biên nhận bảo hành" : "Hình ảnh xác nhận"}
                  shouldUpdate
                  rules={[{ required: isWarrantyIssue }]}
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
                     maxCount={5}
                     method="POST"
                     headers={{
                        Authorization: `Bearer ${Cookies.get("token")}`,
                     }}
                     isImageUrl={checkImageUrl}
                     cropProps={{
                        cropShape: "rect"
                     }}
                     className="w-full"
                     onChange={(info) => {
                        setLoadingImage(false)
                        if (info.file.status === "done") {
                           form.setFieldsValue({ imagesVerify: info.fileList })
                        }
                        if (info.file.status === "uploading") {
                           setLoadingImage(true)
                        }
                        if (info.file.status === "error") {
                           message.error("Tải tệp thất bại")
                        }
                        if (info.file.status === "removed") {
                           form.setFieldsValue({ imagesVerify: info.fileList })
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
