import ImageUploader from "@/components/ImageUploader"
import VideoUploader from "@/components/VideoUploader"
import staff_mutations from "@/features/staff/mutations"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { CloseOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons"
import { Button, Drawer, DrawerProps } from "antd"
import { useState } from "react"

type Issue_Resolve_AssembleDrawerProps = {
   issue?: IssueDto
   onSuccess?: () => void
}
type Props = Omit<DrawerProps, "children"> &
   Issue_Resolve_AssembleDrawerProps & {
      handleClose?: () => void
   }

function Issue_Resolve_AssembleDrawer(props: Props) {
   const [imageUris, setImageUris] = useState<string[]>([])
   const [videoUris, setVideoUris] = useState<string[]>([])

   const mutate_resolveIssue = staff_mutations.issues.resolve()

   function handleSubmit(id: string, imageUris: string[], videoUri?: string) {
      mutate_resolveIssue.mutate(
         {
            id,
            payload: {
               imagesVerify: [...imageUris],
               videosVerify: videoUri,
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
               disabled={!props.issue || !imageUris.length}
               onClick={() => props.issue && handleSubmit(props.issue?.id, imageUris, videoUris[0])}
            >
               Cập nhật
            </Button>
         }
         {...props}
      >
         <section>
            <header className="mb-2">
               <h3 className="text-base font-semibold">Hình ảnh thiết bị</h3>
               <p className="font-base text-sm text-neutral-500">Vui lòng tải hình ảnh thiết bị sau khi lắp đặt</p>
            </header>
            <ImageUploader value={imageUris} onChange={setImageUris} />
         </section>
         <section className="mt-layout">
            <header className="mb-2">
               <h3 className="text-base font-semibold">Video thiết bị (nếu có)</h3>
               <p className="font-base text-sm text-neutral-500">Vui lòng tải video thiết bị sau khi lắp đặt</p>
            </header>
            <VideoUploader value={videoUris} onChange={setVideoUris} />
         </section>
      </Drawer>
   )
}

export default Issue_Resolve_AssembleDrawer
export type { Issue_Resolve_AssembleDrawerProps }
