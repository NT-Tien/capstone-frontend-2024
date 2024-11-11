import ClickableArea from "@/components/ClickableArea"
import ImageUploader from "@/components/ImageUploader"
import ViewMapModal, { ViewMapModalProps } from "@/components/overlays/ViewMap.modal"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import VideoUploader from "@/components/VideoUploader"
import staff_mutations from "@/features/staff/mutations"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import useCurrentLocation from "@/lib/hooks/useCurrentLocation"
import { CloseOutlined, EditOutlined, MoreOutlined, RightOutlined } from "@ant-design/icons"
import { MapPin } from "@phosphor-icons/react"
import { Button, Drawer, DrawerProps } from "antd"
import { useEffect, useRef, useState } from "react"

type Issue_Resolve_InstallDrawerProps = {
   issue?: IssueDto
   onSuccess?: () => void
}
type Props = Omit<DrawerProps, "children"> &
   Issue_Resolve_InstallDrawerProps & {
      handleClose?: () => void
   }

function Issue_Resolve_InstallDrawer(props: Props) {
   const location = useCurrentLocation()

   const control_viewMapModal = useRef<RefType<ViewMapModalProps>>(null)
   const [uploadImages, setUploadImages] = useState<string[]>([])
   const [uploadVideo, setUploadVideo] = useState<string[]>([])
   const [imageUris, setImageUris] = useState<string[]>([])

   const mutate_resolveIssue = staff_mutations.issues.resolve()

   function handleSubmit(uploadImages: string[], uploadVideo: string | undefined, issueId: string) {
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
               props.onSuccess?.()
               props.handleClose?.()
            },
         },
      )
   }

   useEffect(() => {
      if (!props.open) {
      }
   }, [props.open])

   return (
      <Drawer
         title={
            <div className={"flex items-center justify-between"}>
               <Button icon={<CloseOutlined className={"text-white"} />} type={"text"} onClick={props.onClose} />
               <h1>Hoàn thành bước</h1>
               <Button icon={<MoreOutlined className={"text-white"} />} type={"text"} />
            </div>
         }
         classNames={{
            header: "bg-staff text-white",
            footer: "p-layout",
         }}
         closeIcon={false}
         placement={"bottom"}
         height="max-content"
         loading={!props.issue}
         footer={
            <Button
               block
               type="primary"
               size="large"
               icon={<EditOutlined />}
               disabled={!props.issue}
               onClick={() => props.issue && handleSubmit(uploadImages, uploadVideo.length > 0 ? uploadVideo[0] : undefined, props.issue.id)}
            >
               Cập nhật
            </Button>
         }
         {...props}
      >
         <section>
            <header className="mb-2">
               <h1 className="text-base font-bold">Hình ảnh xác nhận</h1>
               <p className="font-base text-sm text-neutral-500">
                  Vui lòng tải hình ảnh lỗi đã sửa lên hê thống (nếu có)
               </p>
            </header>
            <ImageUploader imageUris={uploadImages} setImageUris={setUploadImages} />
         </section>
         <section className="mt-layout">
            <header className="mb-2">
               <h1 className="text-base font-bold">Video xác nhận</h1>
               <p className="font-base text-sm text-neutral-500">Vui lòng tải video lỗi đã sửa lên hê thống (nếu có)</p>
            </header>
            <VideoUploader videoUris={uploadVideo} setVideoUris={setUploadVideo} />
         </section>
         <OverlayControllerWithRef ref={control_viewMapModal}>
            <ViewMapModal />
         </OverlayControllerWithRef>
      </Drawer>
   )
}

export default Issue_Resolve_InstallDrawer
export type { Issue_Resolve_InstallDrawerProps }
