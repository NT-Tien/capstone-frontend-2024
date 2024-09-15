import { ReactNode, useCallback, useMemo, useRef, useState } from "react"
import useModalControls from "@/common/hooks/useModalControls"
import { App, Button, Drawer, Form, Row, Typography, Upload } from "antd"
import { ProFormItem, ProFormTextArea, ProFormUploadDragger } from "@ant-design/pro-components"
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
import Webcam from "react-webcam"
import RecordRTC from "recordrtc"
import { Camera, VideoCamera } from "@phosphor-icons/react"

type SubmitFieldType = {
   imagesVerify?: UploadFile[]
   videosVerify?: UploadFile
}

type Props = {
   onFinish: () => void
}

const CaptureImageDrawer = ({
   open,
   onClose,
   onCapture,
}: {
   open: boolean
   onClose: () => void
   onCapture: (file: File) => void
}) => {
   const webcamRef = useRef<Webcam>(null)

   const capture = useCallback(() => {
      const imageSrc = webcamRef.current?.getScreenshot()
      if (imageSrc) {
         fetch(imageSrc)
            .then((response) => response.blob())
            .then((blob) => onCapture(new File([blob], "captured-image.jpg", { type: blob.type })))
            .catch((err) => console.error("Error capturing image:", err))
      }
   }, [onCapture])

   return (
      <Drawer title="Capture Image" open={open} onClose={onClose} placement="bottom" height="100vh">
         <Webcam
            audio={false}
            screenshotFormat="image/jpeg"
            width="100%"
            ref={webcamRef}
            videoConstraints={{ facingMode: "environment" }}
         />
         <div className="flex justify-center p-3">
            <Button
               type="default"
               onClick={capture}
               className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-gray-300 bg-gray-100 text-gray-800 shadow-md transition-colors duration-200 hover:bg-gray-200 active:bg-gray-300"
            >
               <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 shadow-inner">
                  <Camera size={24} weight="bold" />
               </div>
               <span className="absolute inset-0 rounded-full border-4 border-gray-300"></span>
            </Button>
         </div>
      </Drawer>
   )
}

const RecordVideoDrawer = ({
   open,
   onClose,
   onRecord,
}: {
   open: boolean
   onClose: () => void
   onRecord: (file: File) => void
}) => {
   const [recording, setRecording] = useState(false)
   const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
   const webcamRef = useRef<Webcam>(null)
   const recorderRef = useRef<RecordRTC | null>(null)

   const startRecording = useCallback(() => {
      if (webcamRef.current) {
         const stream = webcamRef.current.video?.srcObject as MediaStream
         if (stream) {
            const recorder = new RecordRTC(stream, {
               type: "video",
               mimeType: "video/webm",
               audio: true,
               video: true,
            })
            recorder.startRecording()
            recorderRef.current = recorder
            setRecording(true)
         }
      }
   }, [])

   const stopRecording = useCallback(() => {
      if (recorderRef.current) {
         recorderRef.current.stopRecording(() => {
            const blob = recorderRef.current?.getBlob()
            if (blob) {
               setVideoBlob(blob)
               onRecord(new File([blob], "recorded-video.webm", { type: "video/webm" }))
               setRecording(false)
               recorderRef.current = null
            }
         })
      }
   }, [onRecord])

   return (
      <Drawer title="Record Video" open={open} onClose={onClose} placement="bottom" height="100vh">
         <Webcam audio={true} width="100%" ref={webcamRef} videoConstraints={{ facingMode: "user" }} />
         <div className="flex justify-center p-3">
            <Button
               type="default"
               onClick={recording ? stopRecording : startRecording}
               className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-red-300 bg-red-500 text-white shadow-md transition-colors duration-200 hover:bg-red-600 active:bg-red-700"
            >
               <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 shadow-inner">
                  <VideoCamera size={24} weight="bold" />
               </div>
               <span className="absolute inset-0 rounded-full border-4 border-red-300"></span>
               <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                  {recording ? "Stop" : "Record"}
               </span>
            </Button>
         </div>
      </Drawer>
   )
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
   const [imageDrawerOpen, setImageDrawerOpen] = useState(false)
   const [videoDrawerOpen, setVideoDrawerOpen] = useState(false)

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
         if (!values.imagesVerify || values.imagesVerify.length === 0) {
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
                  <Button
                     onClick={() => setImageDrawerOpen(true)}
                     type="default"
                     className="flex h-auto w-full items-center justify-center space-x-2 rounded-md border bg-white shadow-md transition-colors duration-200 hover:bg-gray-100 active:bg-gray-200"
                  >
                     <Camera size={32} weight="duotone" className="text-blue-500" />
                     <span className="font-semibold text-gray-800">Capture Image</span>
                  </Button>
               </ProFormItem>

               <ProFormItem name="videosVerify" label="Video xác nhận" shouldUpdate>
                  <Button
                     onClick={() => setVideoDrawerOpen(true)}
                     type="default"
                     className="flex h-auto w-full items-center justify-center space-x-2 rounded-md border bg-white shadow-md transition-colors duration-200 hover:bg-gray-100 active:bg-gray-200"
                  >
                     <VideoCamera size={32} weight="duotone" className="text-red-500" />
                     <span className="font-semibold text-gray-800">Record Video</span>
                  </Button>
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

         <CaptureImageDrawer
            open={imageDrawerOpen}
            onClose={() => setImageDrawerOpen(false)}
            onCapture={(file) => {
               form.setFieldsValue({ imagesVerify: [file] })
               setImageDrawerOpen(false)
            }}
         />

         <RecordVideoDrawer
            open={videoDrawerOpen}
            onClose={() => setVideoDrawerOpen(false)}
            onRecord={(file) => {
               form.setFieldsValue({ videosVerify: file })
               setVideoDrawerOpen(false)
            }}
         />
      </>
   )
}
