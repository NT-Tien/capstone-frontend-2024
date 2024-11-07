import ClickableArea from "@/components/ClickableArea"
import ImageUploader from "@/components/ImageUploader"
import ViewMapModal, { ViewMapModalProps } from "@/components/overlays/ViewMap.modal"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import staff_mutations from "@/features/staff/mutations"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import useCurrentLocation from "@/lib/hooks/useCurrentLocation"
import { CloseOutlined, EditOutlined, MoreOutlined, RightOutlined } from "@ant-design/icons"
import { MapPin } from "@phosphor-icons/react"
import { Button, DatePicker, Drawer, DrawerProps } from "antd"
import dayjs, { Dayjs } from "dayjs"
import { useEffect, useRef, useState } from "react"

type Issue_Resolve_SendDrawerProps = {
   requestId?: string
   issue?: IssueDto
   onSuccess?: () => void
}
type Props = Omit<DrawerProps, "children"> &
   Issue_Resolve_SendDrawerProps & {
      handleClose?: () => void
   }

function Issue_Resolve_SendDrawer(props: Props) {
   const location = useCurrentLocation()

   const control_viewMapModal = useRef<RefType<ViewMapModalProps>>(null)

   const [imageUris, setImageUris] = useState<string[]>([])
   const [date, setDate] = useState<Dayjs | undefined>()

   const mutate_resolveIssue = staff_mutations.issues.resolveSendWarranty()

   function handleSubmit(
      id: string,
      coordinates: GeolocationCoordinates,
      date: Dayjs,
      images: string[],
      requestId: string,
   ) {
      mutate_resolveIssue.mutate(
         {
            id,
            payload: {
               coordinates,
               date: date.toISOString(),
               images,
               requestId,
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
         setDate(undefined)
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
               disabled={!props.issue || !location || !date || !imageUris.length || !props.requestId}
               onClick={() => props.issue && location && date && props.requestId && handleSubmit(props.issue?.id, location?.coords, date, imageUris, props.requestId)}
            >
               Cập nhật
            </Button>
         }
         {...props}
      >
         <section>
            <ClickableArea
               className="items-center justify-start p-3"
               block
               onClick={() => control_viewMapModal.current?.handleOpen({ coordinates: location?.coords })}
            >
               <MapPin size={32} />
               <div className="flex flex-grow flex-col items-start justify-start">
                  <h1 className="text-base font-bold">Vị trí hiện tại</h1>
                  <p className="font-base text-sm text-neutral-500">Xác minh vị trí trung tâm bảo hành</p>
               </div>
               <RightOutlined />
            </ClickableArea>
         </section>
         <section className="mt-8">
            <header className="mb-2">
               <h3 className="text-base font-semibold">Hình ảnh biên nhận</h3>
               <p className="font-base text-sm text-neutral-500">Vui lòng tải hình ảnh biên nhận bảo hành</p>
            </header>
            <ImageUploader imageUris={imageUris} setImageUris={setImageUris} />
         </section>
         <section className="mt-8">
            <header className="mb-2">
               <h3 className="text-base font-semibold">Ngày bảo hành xong</h3>
               <p className="font-base text-sm text-neutral-500">Nhập ngày dự tính bảo hành xong</p>
            </header>
            <DatePicker
               format={"dddd DD/MM/YYYY"}
               placeholder="Chọn ngày"
               className="w-full"
               minDate={dayjs().startOf("day")}
               allowClear={false}
               value={date}
               onChange={(date) => setDate(date)}
            />
         </section>
         <OverlayControllerWithRef ref={control_viewMapModal}>
            <ViewMapModal />
         </OverlayControllerWithRef>
      </Drawer>
   )
}

export default Issue_Resolve_SendDrawer
export type { Issue_Resolve_SendDrawerProps }
