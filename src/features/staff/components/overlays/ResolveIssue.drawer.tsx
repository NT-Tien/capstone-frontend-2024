"use client"

import { Button, Drawer, DrawerProps, Form, Image } from "antd"
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
import ImageUploader from "@/components/ImageUploader"
import VideoUploader from "@/components/VideoUploader"

const CaptureImageDrawer = dynamic(() => import("@/components/CaptureImage.drawer"), { ssr: false })
const CaptureVideoDrawer = dynamic(() => import("@/components/CaptureVideo.drawer"), { ssr: false })

type FieldType = {}
type ResolveIssueDrawerProps = {
   issue?: IssueDto
   onFinish?: () => void
   submitConditions?: (uploadImages: string[], uploadVideo: string | undefined, issueId: string) => boolean
   labels?: {
      image?: string
      video?: string
   }
}
type Props = Omit<DrawerProps, "children"> &
   ResolveIssueDrawerProps & {
      handleClose?: () => void
   }

function ResolveIssueDrawer(props: Props) {
   const [form] = Form.useForm<FieldType>()

   const mutate_uploadImage = useMutation({
      mutationFn: File_Image_Upload,
   })
   const mutate_uploadVideo = useMutation({
      mutationFn: File_Video_Upload,
   })
   const mutate_resolveIssue = staff_mutations.issues.resolve()

   const [uploadImages, setUploadImages] = useState<string[]>([])
   const [uploadVideo, setUploadVideo] = useState<string[]>([])

   function handleSubmit(uploadImages: string[], uploadVideo: string | undefined, issueId: string) {
      if (props.submitConditions) {
         if (!props.submitConditions(uploadImages, uploadVideo, issueId)) {
            return
         }
      }

      mutate_resolveIssue.mutate(
         {
            id: issueId,
            payload: {
               imagesVerify: uploadImages ?? [],
               videosVerify: uploadVideo ?? "",
            },
         },
         {
            onSuccess: () => {
               props.onFinish?.()
               props.handleClose?.()
            },
         },
      )
   }

   return (
      <Drawer
         title={
            <div className={"flex items-center justify-between"}>
               <Button icon={<CloseOutlined className={"text-white"} />} type={"text"} onClick={props.onClose} />
               <h1>Xác nhận Hoàn thành</h1>
               <Button icon={<MoreOutlined className={"text-white"} />} type={"text"} />
            </div>
         }
         closeIcon={false}
         placement={"bottom"}
         height="max-content"
         footer={
            <Button
               block
               type="primary"
               size="large"
               onClick={() =>
                  props.issue &&
                  handleSubmit(uploadImages, uploadVideo.length > 0 ? uploadVideo[0] : undefined, props.issue.id)
               }
            >
               Xác nhận
            </Button>
         }
         classNames={{
            footer: "p-layout",
            header: "bg-staff text-white",
         }}
         {...props}
      >
         <section>
            <header className='mb-2'>
               <h1 className="text-base font-bold">Hình ảnh xác nhận</h1>
               <p className="font-base text-sm text-neutral-500">
                  Vui lòng tải hình ảnh lỗi đã sửa lên hê thống (nếu có)
               </p>
            </header>
            <ImageUploader value={uploadImages} onChange={setUploadImages} />
         </section>
         <section className="mt-layout">
            <header className='mb-2'>
               <h1 className="text-base font-bold">Video xác nhận</h1>
               <p className="font-base text-sm text-neutral-500">Vui lòng tải video lỗi đã sửa lên hê thống (nếu có)</p>
            </header>
            <VideoUploader value={uploadVideo} onChange={setUploadVideo} />
         </section>
      </Drawer>
   )
}

export default ResolveIssueDrawer
export type { ResolveIssueDrawerProps }
