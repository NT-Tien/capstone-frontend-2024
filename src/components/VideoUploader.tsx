import ClickableArea from "@/components/ClickableArea"
import { clientEnv } from "@/env"
import useVideoUploadMutation from "@/features/common/mutations/Video_Upload.mutation"
import { cn } from "@/lib/utils/cn.util"
import { FileVideo } from "@phosphor-icons/react"
import { Button } from "antd"
import dynamic from "next/dynamic"
import { useRef, useState } from "react"
import { CheckOutlined, CloseOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons"

const CaptureVideoDrawer = dynamic(() => import("@/components/CaptureVideo.drawer"), { ssr: false })

type Props = {
   videoUris: string[]
   setVideoUris?: (videoUris: string[]) => void
   className?: string
   maxCount?: number
}

function VideoUploader(props: Props) {
   const [open, setOpen] = useState(false)

   const mutate_uploadVideo = useVideoUploadMutation()

   const maxCount = props.maxCount ?? 1

   const showActions = !!props.setVideoUris

   return (
      <>
         <div className={cn("grid grid-cols-1 gap-2", props.className)}>
            {props.videoUris.map((uri, index) => (
               <VideoView
                  uri={uri}
                  key={uri + index + "_video"}
                  onDelete={(uri) => {
                     props.setVideoUris?.(props.videoUris.filter((item) => item !== uri))
                  }}
                  showActions={showActions}
               />
            ))}
            {new Array(maxCount - props.videoUris.length).fill(null).map((_, index) => (
               <div className="flex flex-col" key={index + "_empty_video"} onClick={() => showActions && setOpen(true)}>
                  <ClickableArea
                     className={cn(
                        "grid h-36 w-full place-items-center rounded-lg bg-gray-100 text-gray-300",
                        showActions && "rounded-b-none",
                     )}
                  >
                     <FileVideo size={32} />
                  </ClickableArea>
                  {showActions && (
                     <Button icon={<PlusOutlined />} block type="dashed" size="small" className="rounded-t-none" />
                  )}
               </div>
            ))}
         </div>
         <CaptureVideoDrawer
            open={open}
            onClose={() => setOpen(false)}
            onRecord={(file) =>
               mutate_uploadVideo.mutate(
                  { file },
                  {
                     onSuccess: (res) => {
                        props.setVideoUris?.([...props.videoUris, res.path])
                        setOpen(false)
                     },
                  },
               )
            }
         />
      </>
   )
}

function VideoView(props: { uri: string; onDelete: (uri: string) => void; showActions: boolean }) {
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
      <div className="flex flex-col">
         <video
            src={clientEnv.BACKEND_URL + "/file-video/" + props.uri}
            controls
            className={cn("rounded-lg", props.showActions && "rounded-b-none")}
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

export default VideoUploader
