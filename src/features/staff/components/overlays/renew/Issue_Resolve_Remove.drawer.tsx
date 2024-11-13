import ClickableArea from "@/components/ClickableArea"
import ImageUploader from "@/components/ImageUploader"
import ViewMapModal, { ViewMapModalProps } from "@/components/overlays/ViewMap.modal"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import staff_mutations from "@/features/staff/mutations"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import useCurrentLocation from "@/lib/hooks/useCurrentLocation"
import { CloseOutlined, EditOutlined, MoreOutlined, RightOutlined } from "@ant-design/icons"
import { MapPin } from "@phosphor-icons/react"
import { Button, Checkbox, DatePicker, Drawer, DrawerProps } from "antd"
import dayjs, { Dayjs } from "dayjs"
import { useEffect, useRef, useState } from "react"
import VideoUploader from "@/components/VideoUploader"
import SignatureUploader from "@/components/SignatureUploader"

type Issue_Resolve_RemoveDrawerProps = {
   requestId?: string
   issue?: IssueDto
   onSuccess?: () => void
}
type Props = Omit<DrawerProps, "children"> &
   Issue_Resolve_RemoveDrawerProps & {
      handleClose?: () => void
   }

function Issue_Resolve_RemoveDrawer(props: Props) {
   const location = useCurrentLocation()

   const control_viewMapModal = useRef<RefType<ViewMapModalProps>>(null)

   const [imageUris, setImageUris] = useState<string[]>([])
   const [date, setDate] = useState<Dayjs | undefined>()
   const [uploadImages, setUploadImages] = useState<string[]>([])
   const [uploadVideo, setUploadVideo] = useState<string[]>([])
   const mutate_resolveIssue = staff_mutations.issues.resolve()
   const [signed, setSigned] = useState<boolean>(false)
   const [signatureVerification, setSignatureVerification] = useState<string | undefined>()

   function handleSubmit(uploadImages: string, uploadVideo: string | undefined, issueId: string, signVerify: string) {
      mutate_resolveIssue.mutate(
         {
            id: issueId,
            payload: {
               imagesVerify: [uploadImages, signVerify],
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
         setSignatureVerification(undefined)
         setUploadImages([])
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
            <div>
               <div className="mb-3 flex items-start gap-3">
                  <Checkbox
                     id="sign"
                     checked={signed}
                     onChange={(e) => setSigned(e.target.checked)}
                     disabled={!signatureVerification || !uploadImages.length}
                  />
                  <label htmlFor="sign" className={"font-bold"}>
                     Tôi đã giao máy cho thủ kho
                  </label>
               </div>
               <Button
                  block
                  type="primary"
                  size="large"
                  icon={<EditOutlined />}
                  disabled={!props.issue || !uploadImages.length || !props.requestId}
                  onClick={() => {
                     if (props.issue && signatureVerification && props.requestId) {
                        handleSubmit(
                           uploadImages[0],
                           uploadVideo.length > 0 ? uploadVideo[0] : undefined,
                           props.issue.id,
                           signatureVerification,
                        )
                     }
                     props.handleClose?.()
                  }}
               >
                  Cập nhật
               </Button>
            </div>
         }
         {...props}
      >
         <section>
            <header className="mb-2">
               <h3 className="text-base font-semibold">Chữ ký xác nhận</h3>
               <p className="font-base text-sm text-neutral-500">Vui lòng đưa thiết bị cho thủ kho ký</p>
            </header>
            <SignatureUploader signature={signatureVerification} setSignature={setSignatureVerification}>
               <SignatureUploader.Stockkeeper />
            </SignatureUploader>
         </section>
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

export default Issue_Resolve_RemoveDrawer
export type { Issue_Resolve_RemoveDrawerProps }
