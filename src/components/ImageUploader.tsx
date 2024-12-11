"use client"

import BackendImage from "@/components/BackendImage"
import ClickableArea from "@/components/ClickableArea"
import { clientEnv } from "@/env"
import useImageUploadMutation from "@/features/common/mutations/Image_Upload.mutation"
import { cn } from "@/lib/utils/cn.util"
import { CheckOutlined, CloseOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons"
import { ImageSquare } from "@phosphor-icons/react"
import { Button, Image } from "antd"
import dynamic from "next/dynamic"
import { useRef, useState } from "react"

const CaptureImageDrawer = dynamic(() => import("@/components/CaptureImage.drawer"), { ssr: false })

type Props = {
   value: string[]
   onChange?: (imageUris: string[]) => void
   className?: string
   maxCount?: number
}

function ImageUploader(props: Props) {
   const [open, setOpen] = useState(false)

   const mutate_uploadImage = useImageUploadMutation()

   const maxCount = props.maxCount ?? 4

   const showActions = !!props.onChange

   return (
      <>
         <div className={cn("grid grid-cols-4 gap-2", props.className)}>
            {props.value.map((uri, index) => (
               <ImageView
                  uri={uri}
                  key={uri + index + "_image"}
                  onDelete={(uri) => {
                     props.onChange?.(props.value.filter((item) => item !== uri))
                  }}
                  showActions={showActions}
               />
            ))}
            {new Array(maxCount - props.value.length).fill(null).map((_, index) => (
               <div className="flex flex-col" key={index + "_empty_image"} onClick={() => showActions && setOpen(true)}>
                  <ClickableArea
                     className={cn(
                        "grid aspect-square place-items-center rounded-lg bg-gray-100 text-gray-300",
                        showActions && "rounded-b-none",
                     )}
                  >
                     <ImageSquare size={32} />
                  </ClickableArea>
                  {showActions && (
                     <Button icon={<PlusOutlined />} block type="dashed" size="small" className="rounded-t-none" />
                  )}
               </div>
            ))}
         </div>
         <CaptureImageDrawer
            open={open}
            onClose={() => setOpen(false)}
            onCapture={(file) =>
               mutate_uploadImage.mutate(
                  { file },
                  {
                     onSuccess: (res) => {
                        props.onChange?.([...props.value, res.path])
                        setOpen(false)
                     },
                  },
               )
            }
         />
      </>
   )
}

function ImageView(props: { uri: string; onDelete: (uri: string) => void; showActions: boolean }) {
   const [showDelete, setShowDelete] = useState(false)
   const timeoutRef = useRef<NodeJS.Timeout>()

   function handleEnableDeleteButton() {
      setShowDelete(true)
      timeoutRef.current = setTimeout(() => setShowDelete(false), 3000)
   }

   function handleDelete() {
      setShowDelete(false)
      props.onDelete(props.uri)
      clearTimeout(timeoutRef.current)
   }

   return (
      <div key={props.uri + "_image"} className="flex flex-col gap-0">
         <BackendImage
            alt="image"
            src={props.uri}
            className={cn("aspect-square w-full rounded-lg", props.showActions && "rounded-b-none")}
         />
         {props.showActions &&
            (showDelete ? (
               <div className="flex">
                  <Button
                     block
                     icon={<CheckOutlined className="text-sm" />}
                     size="small"
                     className="rounded-lg rounded-r-none rounded-t-none"
                     danger
                     type="primary"
                     onClick={handleDelete}
                  ></Button>
                  <Button
                     block
                     icon={<CloseOutlined className="text-sm" />}
                     size="small"
                     className="rounded-lg rounded-l-none rounded-t-none"
                     danger
                     type="default"
                     onClick={() => setShowDelete(false)}
                  ></Button>
               </div>
            ) : (
               <Button
                  icon={<DeleteOutlined className="text-sm" />}
                  danger
                  block
                  size="small"
                  type="primary"
                  className="rounded-lg rounded-t-none"
                  onClick={handleEnableDeleteButton}
               />
            ))}
      </div>
   )
}

export default ImageUploader
