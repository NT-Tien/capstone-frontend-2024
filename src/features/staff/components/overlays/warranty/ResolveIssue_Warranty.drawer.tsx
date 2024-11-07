"use client"

import { App, Button, DatePicker, Drawer, DrawerProps, Form, Image } from "antd"
import dynamic from "next/dynamic"
import { useMutation } from "@tanstack/react-query"
import { File_Image_Upload } from "@/features/common/api/file/upload_image.api"
import { File_Video_Upload } from "@/features/common/api/file/upload_video.api"
import { useState } from "react"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import staff_mutations from "@/features/staff/mutations"
import { CloseOutlined, MoreOutlined } from "@ant-design/icons"
import AlertCard from "@/components/AlertCard"
import { clientEnv } from "@/env"
import { Camera, ImageSquare, Video, VideoCamera } from "@phosphor-icons/react"
import { Dayjs } from "dayjs"
import { SendWarrantyTypeErrorId } from "@/lib/constants/Warranty"
import { RequestDto } from "@/lib/domain/Request/Request.dto"

const CaptureImageDrawer = dynamic(() => import("../CaptureImage.drawer"), { ssr: false })
const CaptureVideoDrawer = dynamic(() => import("../CaptureVideo.drawer"), { ssr: false })

type FieldType = {
   warranty_date: Dayjs
}
type ResolveIssue_WarrantyDrawerProps = {
   issue?: IssueDto
   request?: RequestDto
   onFinish?: () => void
}
type Props = Omit<DrawerProps, "children"> &
   ResolveIssue_WarrantyDrawerProps & {
      handleClose?: () => void
   }

function ResolveIssue_WarrantyDrawer(props: Props) {
   const [form] = Form.useForm<FieldType>()
   const { message } = App.useApp()

   const mutate_uploadImage = useMutation({
      mutationFn: File_Image_Upload,
   })
   const mutate_uploadVideo = useMutation({
      mutationFn: File_Video_Upload,
   })
   const mutate_resolveIssue = staff_mutations.issues.resolve()
   const mutate_updateWarranty = staff_mutations.request.updateWarrantyDate()

   const [imageDrawerOpen, setImageDrawerOpen] = useState(false)
   const [videoDrawerOpen, setVideoDrawerOpen] = useState(false)
   const [uploadImages, setUploadImages] = useState<string[]>([])
   const [uploadVideo, setUploadVideo] = useState<string | undefined>()

   async function handleSubmit(
      uploadImages: string[],
      uploadVideo: string | undefined,
      issue: IssueDto,
      warrantyDate?: Dayjs,
      requestId?: string,
   ) {
      if (uploadImages.length === 0 || uploadImages.every((i) => !!i === false)) {
         message.error("Vui lòng tải lên ít nhất 1 hình ảnh")
         return
      }

      if (issue.typeError.id === SendWarrantyTypeErrorId && !warrantyDate) {
         message.error("Vui lòng chọn ngày bảo hành xong")
         return
      }

      console.log(requestId, warrantyDate, issue.typeError.id === SendWarrantyTypeErrorId)

      try {
         await mutate_resolveIssue.mutateAsync({
            id: issue.id,
            payload: {
               imagesVerify: uploadImages ?? [],
               videosVerify: uploadVideo ?? "",
            },
         })

         console.log(warrantyDate)

         if (issue.typeError.id === SendWarrantyTypeErrorId && warrantyDate && requestId) {
            await mutate_updateWarranty.mutateAsync({
               id: requestId,
               payload: {
                  warrantyDate: warrantyDate.toISOString(),
               },
            })
         }

         props.onFinish?.()
         props.handleClose?.()
      } catch (e) {
         console.error(e)
      }
   }

   return (
      <Drawer
         title={
            <div className={"flex items-center justify-between"}>
               <Button icon={<CloseOutlined className={"text-white"} />} type={"text"} onClick={props.onClose} />
               <h1>Hoàn thành bước</h1>
               <Button icon={<MoreOutlined className={"text-white"} />} type={"text"} />
            </div>
         }
         closeIcon={false}
         placement={"bottom"}
         height="85%"
         footer={
            <Button block type="primary" size="large" onClick={form.submit}>
               Xác nhận thành công
            </Button>
         }
         classNames={{
            footer: "p-layout",
            header: "bg-staff text-white",
         }}
         {...props}
      >
         <Form<FieldType>
            form={form}
            onValuesChange={(values) => {
               console.log(values, typeof values.imagesVerify?.[0])
            }}
            onFinish={(values) =>
               props.issue &&
               handleSubmit(uploadImages, uploadVideo, props.issue, values.warranty_date, props.request?.id)
            }
            initialValues={{
               imagesVerify: [],
            }}
         >
            <Form.Item<FieldType> name={"warranty_date"} label={"Ngày bảo hành xong dự kiến (bắt buộc)"}>
               <DatePicker className={"w-full"} size={"large"} />
            </Form.Item>

            <Form.Item<FieldType> label={"Hình ảnh biên lai bảo hành (bắt buộc)"} shouldUpdate>
               <div className="mb-2 grid grid-cols-5 gap-2">
                  {uploadImages.map((img) => (
                     <Button
                        key={img + "_button"}
                        size="small"
                        danger
                        onClick={() => {
                           setUploadImages((prev) => prev.filter((i) => i !== img))
                        }}
                     >
                        Xóa
                     </Button>
                  ))}
               </div>
               <div className="mb-3 grid grid-cols-5 gap-2">
                  {uploadImages.map((image) => (
                     <Image
                        alt="image"
                        key={image + "_image"}
                        src={clientEnv.BACKEND_URL + "/file-image/" + image}
                        className="aspect-square w-full rounded-lg"
                     />
                  ))}
                  {new Array(5 - uploadImages.length).fill(null).map((_, index) => (
                     <div
                        key={index + "_empty_image"}
                        className="grid aspect-square place-items-center rounded-lg bg-gray-100 text-gray-300"
                     >
                        <ImageSquare size={32} />
                     </div>
                  ))}
               </div>
               <Button
                  onClick={() => setImageDrawerOpen(true)}
                  type="default"
                  className="flex w-full items-center justify-center gap-3"
                  size="large"
               >
                  <Camera size={24} weight="duotone" className="text-blue-500" />
                  <span>Thêm hình ảnh</span>
               </Button>
            </Form.Item>

            <Form.Item label="Video xác nhận (nếu có)" shouldUpdate>
               <div className="mb-3">
                  {uploadVideo && (
                     <div className="mb-2">
                        <Button
                           size="small"
                           danger
                           onClick={() => {
                              setUploadVideo(undefined)
                           }}
                        >
                           Xóa
                        </Button>
                     </div>
                  )}
                  {uploadVideo && <video src={clientEnv.BACKEND_URL + "/file-video/" + uploadVideo} controls />}
                  {!uploadVideo && (
                     <div className="grid h-36 w-full place-items-center rounded-lg bg-gray-100 text-gray-300">
                        <Video size={32} />
                     </div>
                  )}
               </div>
               <Button
                  onClick={() => setVideoDrawerOpen(true)}
                  type="default"
                  size="large"
                  className="flex w-full items-center justify-center gap-3"
               >
                  <VideoCamera size={24} weight="duotone" className="text-red-500" />
                  <span className="">Thêm video</span>
               </Button>
            </Form.Item>
         </Form>

         <CaptureImageDrawer
            open={imageDrawerOpen}
            onClose={() => setImageDrawerOpen(false)}
            onCapture={async (file) => {
               const result = await mutate_uploadImage.mutateAsync({ file })
               setUploadImages((prev) => [...prev, result.data.path])
               setImageDrawerOpen(false)
            }}
         />

         <CaptureVideoDrawer
            open={videoDrawerOpen}
            onClose={() => setVideoDrawerOpen(false)}
            onRecord={async (file) => {
               const result = await mutate_uploadVideo.mutateAsync({ file })
               setUploadVideo(result.data.path)
               setVideoDrawerOpen(false)
            }}
         />
      </Drawer>
   )
}

export default ResolveIssue_WarrantyDrawer
export type { ResolveIssue_WarrantyDrawerProps }
