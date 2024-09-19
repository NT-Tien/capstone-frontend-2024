import { File_Image_Upload } from "@/_api/file/upload_image.api"
import { File_Video_Upload } from "@/_api/file/upload_video.api"
import Staff_Issue_UpdateFinish from "@/app/staff/_api/issue/update-finish"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import useModalControls from "@/common/hooks/useModalControls"
import AlertCard from "@/components/AlertCard"
import { SendWarrantyTypeErrorId } from "@/constants/Warranty"
import { clientEnv } from "@/env"
import { Camera, ImageSquare, Video, VideoCamera } from "@phosphor-icons/react"
import { useMutation } from "@tanstack/react-query"
import { App, Button, Drawer, Form, Image } from "antd"
import { ReactNode, useMemo, useState } from "react"
import dynamic from "next/dynamic"

const CaptureImageDrawer = dynamic(() => import("./Capturemage.drawer"), { ssr: false })
const CaptureVideoDrawer = dynamic(() => import("./CaptureVideo.drawer"), { ssr: false })

type SubmitFieldType = {
   imagesVerify?: string[]
   videosVerify?: string
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
            setUploadImages([])
            setUploadVideo(undefined)
         }, 200)
      },
   })

   const mutate_uploadImage = useMutation({
      mutationFn: File_Image_Upload,
   })

   const mutate_uploadVideo = useMutation({
      mutationFn: File_Video_Upload,
   })

   const [issue, setIssue] = useState<FixRequestIssueDto | undefined>(undefined)
   const [imageDrawerOpen, setImageDrawerOpen] = useState(false)
   const [videoDrawerOpen, setVideoDrawerOpen] = useState(false)
   const [uploadImages, setUploadImages] = useState<string[]>([])
   const [uploadVideo, setUploadVideo] = useState<string | undefined>()

   const isWarrantyIssue = useMemo(() => {
      return issue?.typeError.id === SendWarrantyTypeErrorId
   }, [issue])

   const mutate_resolveIssue = useMutation({
      mutationFn: Staff_Issue_UpdateFinish,
      onMutate: async () => {
         message.open({
            type: "loading",
            content: "Chờ đợi...",
            key: "loading",
         })
      },
      onError: async () => {
         message.error({
            content: "Đã xảy ra lỗi khi hoàn thành vấn đề.",
         })
      },
      onSuccess: async () => {
         message.success({
            content: "Hoàn thành vấn đề thành công.",
         })
      },
      onSettled: () => {
         message.destroy("loading")
      },
   })

   function handleSubmit(values: SubmitFieldType) {
      if (!issue) return

      if (isWarrantyIssue) {
         if (uploadImages.length === 0) {
            message.error("Vui lòng tải ảnh lên.")
            return
         }
      }

      mutate_resolveIssue.mutate(
         {
            id: issue.id,
            payload: {
               imagesVerify: uploadImages ?? [],
               videosVerify: uploadVideo ?? "",
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
               {isWarrantyIssue && (
                  <AlertCard
                     text="Vui lòng cập nhật biên nhận bảo hành để hoàn thành lỗi."
                     type="info"
                     className="mb-3"
                  />
               )}
               <Form.Item<SubmitFieldType>
                  label={isWarrantyIssue ? "Biên nhận bảo hành" : "Hình ảnh xác nhận"}
                  shouldUpdate
                  rules={[{ required: isWarrantyIssue }]}
               >
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

               <Form.Item label="Video xác nhận" shouldUpdate>
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
      </>
   )
}
