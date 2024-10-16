import { Drawer, DrawerProps, QRCode } from "antd"
import AlertCard from "@/components/AlertCard"
import Button from "antd/es/button"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { IssueSparePartDto } from "@/lib/domain/IssueSparePart/IssueSparePart.dto"

type ReturnSparePartDrawerProps = {
   task?: TaskDto
   returnSpareParts?: IssueSparePartDto[]
   onFinish?: () => void
}
type Props = Omit<DrawerProps, "children"> & ReturnSparePartDrawerProps

function ReturnSparePartDrawer(props: Props) {
   return (
      <Drawer
         title="Trả linh kiện"
         classNames={{
            footer: "p-layout",
         }}
         placement="bottom"
         height="max-content"
         footer={
            <Button block type="primary" size="large" onClick={props.onFinish}>
               Hoàn tất
            </Button>
         }
         {...props}
      >
         <AlertCard text="Vui lòng xuống kho để trả các linh kiện không sử dụng" type="info" className="mb-layout" />
         {props.task && (
            <section>
               <QRCode value={props.task.id} className="size-full" />
               <section className="mt-layout">
                  <h3
                     className="mb-1 text-lg font-semibold"
                     onClick={() => {
                        props.task && window.navigator.clipboard.writeText(props.task.id)
                     }}
                  >
                     Linh kiện cần trả
                  </h3>
                  <div className="h-32 overflow-y-auto rounded-lg bg-neutral-200 p-2">
                     {props.returnSpareParts?.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                           <h4>{item.sparePart.name}</h4>
                           <div>x{item.quantity}</div>
                        </div>
                     ))}
                  </div>
               </section>
            </section>
         )}
      </Drawer>
   )
}

export default ReturnSparePartDrawer
export type { ReturnSparePartDrawerProps }
