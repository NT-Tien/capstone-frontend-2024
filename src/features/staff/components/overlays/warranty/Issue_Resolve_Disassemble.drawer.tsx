import ImageUploader from "@/components/ImageUploader"
import SignatureUploader from "@/components/SignatureUploader"
import staff_mutations from "@/features/staff/mutations"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { CloseOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons"
import { Wrench } from "@phosphor-icons/react"
import { Button, Drawer, DrawerProps } from "antd"
import { useEffect, useState } from "react"

type Issue_Resolve_DisassembleDrawerProps = {
   issue?: IssueDto
   onSuccess?: () => void
}
type Props = Omit<DrawerProps, "children"> &
   Issue_Resolve_DisassembleDrawerProps & {
      handleClose?: () => void
   }

function Issue_Resolve_DisassembleDrawer(props: Props) {
   const [imageUris, setImageUris] = useState<string[]>([])
   const [signature, setSignature] = useState<string | undefined>()

   const mutate_resolveIssue = staff_mutations.issues.resolve()

   function handleSubmit(id: string, signature: string, imageUris: string[]) {
      mutate_resolveIssue.mutate(
         {
            id,
            payload: {
               imagesVerify: [signature, ...imageUris],
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
         setSignature(undefined)
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
               disabled={!props.issue || !signature || !imageUris.length}
               onClick={() => props.issue && signature && handleSubmit(props.issue?.id, signature, imageUris)}
            >
               Cập nhật
            </Button>
         }
         {...props}
      >
         <section>
            <header className="mb-2">
               <h3 className="text-base font-semibold">Hình ảnh thiết bị</h3>
               <p className="font-base text-sm text-neutral-500">Vui lòng tải hình ảnh thiết bị sau khi tháo gỡ</p>
            </header>
            <ImageUploader imageUris={imageUris} setImageUris={setImageUris} />
         </section>
         <section className="mt-8">
            <header className="mb-2">
               <h3 className="text-base font-semibold">Chữ ký xác nhận</h3>
               <p className="font-base text-sm text-neutral-500">Vui lòng đưa thiết bị cho trưởng phòng sản xuất ký</p>
            </header>
            <SignatureUploader setSignature={setSignature} signature={signature}>
               <SignatureUploader.Head_Department />
            </SignatureUploader>
         </section>
      </Drawer>
   )
}

export default Issue_Resolve_DisassembleDrawer
export type { Issue_Resolve_DisassembleDrawerProps }
