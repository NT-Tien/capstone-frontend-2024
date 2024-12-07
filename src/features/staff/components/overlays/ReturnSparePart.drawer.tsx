"use client"

import { Checkbox, Drawer, DrawerProps, QRCode } from "antd"
import AlertCard from "@/components/AlertCard"
import Button from "antd/es/button"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { IssueSparePartDto } from "@/lib/domain/IssueSparePart/IssueSparePart.dto"
import { useState } from "react"

type ReturnSparePartDrawerProps = {
   task?: TaskDto
   returnSpareParts?: IssueSparePartDto[]
   onFinish?: () => void
}
type Props = Omit<DrawerProps, "children"> & ReturnSparePartDrawerProps

function ReturnSparePartDrawer(props: Props) {
   const [signed, setSigned] = useState<boolean>(false)
   return (
      <Drawer
         title="Trả linh kiện"
         classNames={{
            footer: "p-layout",
         }}
         placement="bottom"
         height="100%"
         footer={
            <div>
               {/* <div className="mb-3 flex items-start gap-3">
                  <Checkbox id="sign" checked={signed} onChange={(e) => setSigned(e.target.checked)} />
                  <label htmlFor="sign" className={"font-bold"}>
                     Tôi đã ký xác nhận
                  </label>
               </div> */}
               <Button block type="primary" size="large" onClick={props.onFinish}>
                  Đóng
               </Button>
            </div>
         }
         {...props}
      >
         <AlertCard text="Vui lòng xuống kho để trả các linh kiện không sử dụng" type="info" className="mb-layout" />
         {props.task && (
            <section>
               <QRCode value={props.task.id} className="aspect-square h-max w-full" />
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
