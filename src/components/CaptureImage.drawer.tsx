import { Camera } from "@phosphor-icons/react"
import { App, Button, Drawer } from "antd"
import { useCallback, useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"

function CaptureImageDrawer({
   open,
   onClose,
   onCapture,
}: {
   open: boolean
   onClose: () => void
   onCapture: (file: File) => void
}) {
   const webcamRef = useRef<Webcam>(null)

   const [render, setRender] = useState(false)
   const { message } = App.useApp()

   const capture = useCallback(() => {
      const imageSrc = webcamRef.current?.getScreenshot()
      if (imageSrc) {
         fetch(imageSrc)
            .then((response) => response.blob())
            .then((blob) => onCapture(new File([blob], "captured-image.jpg", { type: blob.type })))
            .catch((err) => console.error("Error capturing image:", err))
      }
   }, [onCapture])

   useEffect(() => {
      setRender(true)
   }, [])

   if (!render) return null

   return (
      <Drawer
         title="Thêm hình ảnh"
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
            audio={false}
            screenshotFormat="image/jpeg"
            className="h-full w-full object-cover"
            ref={webcamRef}
            onUserMediaError={(err) => {
               console.error("Error capturing image:", err)
               message.error({
                  content: `Không thể truy cập camera. ${err.toString()}`,
               })
            }}
            videoConstraints={{ facingMode: "environment" }}
         />
         <div className="absolute bottom-0 flex w-full items-center justify-center p-3">
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

export default CaptureImageDrawer
