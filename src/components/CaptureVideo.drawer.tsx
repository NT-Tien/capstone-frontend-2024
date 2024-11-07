import { Button, Drawer } from "antd"
import { useCallback, useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import RecordRTC from "recordrtc"

function CaptureVideoDrawer({
   open,
   onClose,
   onRecord,
}: {
   open: boolean
   onClose: () => void
   onRecord: (file: File) => void
}) {
   const [recording, setRecording] = useState(false)
   const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
   const webcamRef = useRef<Webcam>(null)
   const recorderRef = useRef<RecordRTC | null>(null)

   const [render, setRender] = useState(false)

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

   useEffect(() => {
      setRender(true)
   }, [])

   if (!render) return null

   return (
      <Drawer
         title="Thêm Video"
         open={open}
         onClose={onClose}
         placement="bottom"
         height="100vh"
         destroyOnClose
         classNames={{
            body: "p-0",
         }}
      >
         <Webcam
            audio={true}
            className="h-full w-full object-cover"
            ref={webcamRef}
            videoConstraints={{ facingMode: "user" }}
         />
         <div className="absolute bottom-0 flex w-full items-center justify-center p-3">
            <Button
               type="default"
               onClick={recording ? stopRecording : startRecording}
               className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-red-300 bg-red-500 text-white shadow-md transition-colors duration-200 hover:bg-red-600 active:bg-red-700"
            >
               {/* <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 shadow-inner">
                <VideoCamera size={24} weight="bold" />
             </div> */}
               <span className="absolute inset-0 rounded-full border-4 border-red-300"></span>
               <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                  {recording ? "Dừng" : "Bắt đầu"}
               </span>
            </Button>
         </div>
      </Drawer>
   )
}

export default CaptureVideoDrawer
