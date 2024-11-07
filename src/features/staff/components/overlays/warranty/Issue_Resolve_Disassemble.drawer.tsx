import { Button, Descriptions, Drawer, DrawerProps } from "antd"
import { CloseOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import ImageUploader from "@/components/ImageUploader"
import { useState } from "react"

type Issue_Resolve_DisassembleDrawerProps = {
   issue?: IssueDto
}
type Props = Omit<DrawerProps, "children"> & Issue_Resolve_DisassembleDrawerProps
function Issue_Resolve_DisassembleDrawer(props: Props) {
   const [imageUris, setImageUris] = useState<string[]>([])

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
         height="85%"
         loading={!props.issue}
         footer={
            <Button block type="primary" size="large" icon={<EditOutlined />}>
               Cập nhật
            </Button>
         }
         {...props}
      >
         <ImageUploader imageUris={imageUris} setImageUris={setImageUris} />
      </Drawer>
   )
}

export default Issue_Resolve_DisassembleDrawer
export type { Issue_Resolve_DisassembleDrawerProps }
