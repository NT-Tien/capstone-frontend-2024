import { File_Image_Upload } from "@/features/common/api/file/upload_image.api"
import AlertCard from "@/components/AlertCard"
import { DeleteOutlined, RedoOutlined, UndoOutlined } from "@ant-design/icons"
import { Eraser, Pen } from "@phosphor-icons/react"
import { useMutation } from "@tanstack/react-query"
import { App, Button, Checkbox, Drawer, DrawerProps, Segmented, Slider } from "antd"
import { forwardRef, ReactNode, useImperativeHandle, useRef, useState } from "react"
import { CanvasPath, ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas"
import useModalControls from "../../lib/hooks/useModalControls"
import { cn } from "@/lib/utils/cn.util"

type CreateSignatureDrawerRefType = {
   handleOpen: () => void
   handleClose: () => void
}

type Props = {
   children?: (handleOpen: () => void) => ReactNode
   onSubmit: (res: string) => void
   text?: string
   alertTitle?: string
   drawerProps?: Omit<DrawerProps, "children">
}

const CreateSignatureDrawer = forwardRef<CreateSignatureDrawerRefType, Props>(function Component(props, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => {
         control_signatureController.current?.handleClear()
      },
   })
   const [strokes, setStrokes] = useState<CanvasPath[]>([])
   const [isChecked, setIsChecked] = useState(false)
   const control_signatureController = useRef<SignatureControllerRefType | null>(null)

   useImperativeHandle(ref, () => ({
      handleOpen,
      handleClose,
   }))

   return (
      <>
         {props.children?.(handleOpen)}
         <Drawer
            open={open}
            onClose={handleClose}
            placement="bottom"
            height="100%"
            title="Ký tên"
            footer={
               <Button
                  size="large"
                  className="w-full"
                  type="primary"
                  disabled={!isChecked || strokes.length == 0}
                  onClick={() => {
                     control_signatureController.current?.handleExport()
                  }}
               >
                  Gửi
               </Button>
            }
            classNames={{
               footer: "p-layout",
            }}
            {...props.drawerProps}
         >
            <AlertCard text={props.alertTitle ?? "Vui lòng ký tên vào phía dưới"} type="info" />
            <SignatureController
               ref={control_signatureController}
               onSubmit={props.onSubmit}
               strokes={strokes}
               setStrokes={setStrokes}
            />
            <section className="pt-3">
               <Checkbox checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)}>
                  {props.text ?? "Tôi xác nhận nhân viên đã hoàn thành tác vụ."}
               </Checkbox>
            </section>
         </Drawer>
      </>
   )
})

type SignatureControllerRefType = {
   handleExport: () => Promise<string | undefined>
   handleClear: () => void
}

type SignatureControllerProps = {
   onSubmit?: Props["onSubmit"]
   strokes: CanvasPath[]
   setStrokes: (strokes: CanvasPath[]) => void
   height?: string
   className?: string
}

const SignatureController = forwardRef<SignatureControllerRefType, SignatureControllerProps>(function Component(
   { strokes, setStrokes, ...props },
   ref,
) {
   const canvasRef = useRef<ReactSketchCanvasRef | null>(null)
   const { message } = App.useApp()

   const [tool, setTool] = useState<"pen" | "eraser">("pen")
   const [strokeWidth, setStrokeWidth] = useState(5)
   const [eraserWidth, setEraserWidth] = useState(10)

   function handleChangeTool(tool: string) {
      setTool(tool as any)
      canvasRef.current?.eraseMode(tool === "eraser")
   }

   const mutate_uploadFile = useMutation({
      mutationFn: File_Image_Upload,
   })

   useImperativeHandle(ref, () => ({
      handleExport,
      handleClear,
   }))

   function handleClear() {
      canvasRef.current?.clearCanvas()
   }

   async function handleExport() {
      const canvas = canvasRef.current
      if (canvas) {
         try {
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

            const result = await mutate_uploadFile.mutateAsync({
               file: file,
            })

            const path = result.data?.path
            props.onSubmit?.(path)
            return path
         } catch (error) {
            console.error(error)
            message.error("Có lỗi xảy ra khi gửi chữ ký, vui lòng thử lại")
         }
      }
   }

   return (
      <article className={cn(props.className)}>
         <section className="mb-3 mt-layout flex items-center">
            <div className="flex-grow">
               <Segmented
                  value={tool}
                  onChange={(e) => handleChangeTool(e)}
                  size="large"
                  options={[
                     {
                        value: "pen",
                        className: "p-0",
                        label: (
                           <div className="flex h-full min-h-[36px] w-7 items-center justify-center">
                              <Pen size={20} weight={tool === "pen" ? "fill" : "regular"} />
                           </div>
                        ),
                     },
                     {
                        value: "eraser",
                        className: "p-0",
                        label: (
                           <div className="flex h-full min-h-[36px] w-7 items-center justify-center">
                              <Eraser size={20} weight={tool === "eraser" ? "fill" : "regular"} />
                           </div>
                        ),
                     },
                  ]}
               />
            </div>
            <Button.Group className="mr-2">
               <Button
                  size="large"
                  icon={<UndoOutlined />}
                  onClick={() => {
                     canvasRef.current?.undo()
                  }}
               />
               <Button
                  size="large"
                  icon={<RedoOutlined />}
                  onClick={() => {
                     canvasRef.current?.redo()
                  }}
               />
            </Button.Group>
            <Button
               type="primary"
               size="large"
               danger
               icon={<DeleteOutlined />}
               onClick={() => {
                  canvasRef.current?.clearCanvas()
               }}
            ></Button>
         </section>
         <section>
            <Slider
               value={tool === "pen" ? strokeWidth : eraserWidth}
               onChange={(e) => {
                  if (tool === "pen") setStrokeWidth(e)
                  else setEraserWidth(e)
               }}
               min={tool === "pen" ? 1 : 1}
               max={tool === "pen" ? 10 : 40}
            />
         </section>
         <ReactSketchCanvas
            ref={canvasRef}
            onChange={(e) => {
               setStrokes(e)
            }}
            width="100%"
            height={props.height ?? "250px"}
            canvasColor="white"
            exportWithBackgroundImage
            strokeColor="#a855f7"
            strokeWidth={strokeWidth}
            eraserWidth={eraserWidth}
         />
      </article>
   )
})

export default CreateSignatureDrawer
export { SignatureController }
export type { SignatureControllerRefType, CreateSignatureDrawerRefType }
