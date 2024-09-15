import { forwardRef, ReactNode, useImperativeHandle, useRef, useState } from "react"
import useModalControls from "../hooks/useModalControls"
import { CanvasPath, ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas"
import { App, Button, Card, Checkbox, Drawer, Radio, Segmented, Slider } from "antd"
import { Eraser, Pen } from "@phosphor-icons/react"
import { UndoOutlined, RedoOutlined, DeleteOutlined } from "@ant-design/icons"
import { useMutation } from "@tanstack/react-query"
import { File_Image_Upload } from "@/_api/file/upload_image.api"
import AlertCard from "@/components/AlertCard"

export type CreateSignatureDrawerRefType = {
   handleOpen: () => void
   handleClose: () => void
}

type Props = {
   children?: (handleOpen: () => void) => ReactNode
   onSubmit: (res: string) => void
}

const CreateSignatureDrawer = forwardRef<CreateSignatureDrawerRefType, Props>(function Component(props, ref) {
   const { open, handleOpen, handleClose } = useModalControls({
      onClose: () => {
         canvasRef.current?.clearCanvas()
      },
   })
   const { message } = App.useApp()
   const canvasRef = useRef<ReactSketchCanvasRef | null>(null)

   const [strokes, setStrokes] = useState<CanvasPath[]>([])
   const [tool, setTool] = useState<"pen" | "eraser">("pen")
   const [strokeWidth, setStrokeWidth] = useState(5)
   const [eraserWidth, setEraserWidth] = useState(10)
   const [isChecked, setIsChecked] = useState(false)

   function handleChangeTool(tool: string) {
      setTool(tool as any)
      canvasRef.current?.eraseMode(tool === "eraser")
   }

   const mutate_uploadFile = useMutation({
      mutationFn: File_Image_Upload,
   })

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
            props.onSubmit(path)
         } catch (error) {
            console.error(error)
            message.error("Có lỗi xảy ra khi gửi chữ ký, vui lòng thử lại")
         }
      }
   }

   useImperativeHandle(ref, () => ({
      handleOpen,
      handleClose,
   }))

   return (
      <>
         {props.children?.(handleOpen)}
         <Drawer open={open} onClose={handleClose} placement="bottom" height="100%" title="Ký tên">
            <AlertCard text="Vui lòng ký tên vào phía dưới" type="info" />
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
               height="250px"
               canvasColor="white"
               exportWithBackgroundImage
               strokeColor="#a855f7"
               strokeWidth={strokeWidth}
               eraserWidth={eraserWidth}
            />
            <section className="pt-3">
               <Checkbox checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)}>
                  Tôi xác nhận nhân viên đã hoàn thành tác vụ.
               </Checkbox>
            </section>
            <section className="fixed bottom-0 left-0 w-full bg-white p-layout shadow-lg">
               <Button
                  size="large"
                  className="w-full"
                  type="primary"
                  disabled={!isChecked || strokes.length == 0}
                  onClick={handleExport}
               >
                  Gửi
               </Button>
            </section>
         </Drawer>
      </>
   )
})

export default CreateSignatureDrawer
