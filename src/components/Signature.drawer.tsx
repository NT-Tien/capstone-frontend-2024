import { Button, Drawer, DrawerProps } from "antd"
import { ReactNode, useEffect, useRef, useState } from "react"
import { ReactSketchCanvas, ReactSketchCanvasRef, CanvasPath } from "react-sketch-canvas"
import { DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { Wrench } from "@phosphor-icons/react"
import useImageUploadMutation from "@/features/common/mutations/Image_Upload.mutation"

type SignatureDrawerProps = {
   onSubmit?: (path: string) => void
   children?: ReactNode
}
type Props = Omit<DrawerProps, "children"> &
   SignatureDrawerProps & {
      handleClose?: () => void
   }

function SignatureDrawer(props: Props) {
   const canvasRef = useRef<ReactSketchCanvasRef | null>(null)
   const [strokes, setStrokes] = useState<CanvasPath[]>([])

   const mutate_uploadFile = useImageUploadMutation()

   async function handleExport() {
      const canvas = canvasRef.current
      if (!canvas) return

      const image = await canvas.exportImage("png")
      const base64Data = image.replace(/^data:image\/png;base64,/, "")

      // Decode the base64 string
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
         byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      // Create a Blob
      const blob = new Blob([byteArray], { type: "image/png" })

      // Create a File
      const file = new File([blob], "signature", { type: "image/png" })

      mutate_uploadFile.mutate(
         {
            file,
         },
         {
            onSuccess: (res) => {
               const path = res.path
               props.onSubmit?.(path)
               props.handleClose?.()
            },
         },
      )
   }

   useEffect(() => {
    if(!props.open) {
        canvasRef.current?.clearCanvas()
    }
   }, [props.open])

   return (
      <Drawer
         title="Thêm chữ ký"
         extra={
            <Button type="primary" icon={<EditOutlined />} disabled={strokes.length === 0} onClick={handleExport}>
               Cập nhật
            </Button>
         }
         placement="bottom"
         height="max-content"
         classNames={{
            header: "border-b-0 pb-0",
         }}
         {...props}
      >
         <div className="relative">
            <Button
               icon={<DeleteOutlined />}
               danger
               type="primary"
               className="absolute bottom-3 right-3"
               onClick={() => {
                  canvasRef.current?.clearCanvas()
               }}
            />
            <div className="pointer-events-none absolute inset-0 m-auto grid place-items-center">
               {props.children}
            </div>
            <ReactSketchCanvas
               ref={canvasRef}
               onChange={(e) => {
                  setStrokes(e)
               }}
               width="100%"
               height={"250px"}
               canvasColor="white"
               exportWithBackgroundImage
               strokeColor="#a855f7"
               strokeWidth={5}
            />
         </div>
      </Drawer>
   )
}

export default SignatureDrawer
export type { SignatureDrawerProps }
