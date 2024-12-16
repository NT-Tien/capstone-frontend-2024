import ImageUploader from "@/components/ImageUploader"
import { DeviceWarrantyCardDto } from "@/lib/domain/DeviceWarrantyCard/DeviceWarrantyCard.dto"
import { DeviceWarrantyCardStatus } from "@/lib/domain/DeviceWarrantyCard/DeviceWarrantyCardStatus.enum"
import { FileFilled } from "@ant-design/icons"
import { Button, Drawer, DrawerProps } from "antd"
import dayjs from "dayjs"

type Task_WarrantyReceive_ResolveWarrantyFailedDrawerProps = {
   warrantyCard?: DeviceWarrantyCardDto
   requestId?: string
}
type Props = Omit<DrawerProps, "children"> & Task_WarrantyReceive_ResolveWarrantyFailedDrawerProps

function Task_WarrantyReceive_ResolveWarrantyFailedDrawer(props: Props) {
   return (
      <Drawer
         title="Kiểm tra tác vụ"
         placement="bottom"
         height="max-content"
         footer={
            <Button block type='primary'>
                Đóng yêu cầu
            </Button>
         }
         classNames={{
            footer: "p-layout",
         }}
         {...props}
      >
         {props.warrantyCard && (
            <article>
               <header className="mb-1 flex items-center gap-3">
                  <h2 className="whitespace-nowrap text-lg font-bold">
                     <FileFilled className="mr-1" /> Đơn nhận thiết bị
                  </h2>
                  <div className="h-0.5 w-full bg-neutral-300" />
               </header>
               <main className="space-y-3">
                  <section>
                     <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Ngày nhận máy</h3>
                     <p className="text-sm">{dayjs(props.warrantyCard.receive_date).format("DD/MM/YYYY HH:mm")}</p>
                  </section>
                  <section>
                     <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Ghi chú</h3>
                     <p className="text-sm">{props.warrantyCard.receive_note}</p>
                  </section>
                  <section>
                     <h3 className="mb-0.5 text-sm font-semibold text-neutral-800">Trạng thái bảo hành</h3>
                     <p className="text-sm">
                        {props.warrantyCard.status === DeviceWarrantyCardStatus.SUCCESS
                           ? "Bảo hành thành công"
                           : "Từ chối bảo hành"}
                     </p>
                  </section>
                  <section>
                     <h3 className="mb-1 text-sm font-semibold text-neutral-800">Hình ảnh đơn</h3>
                     <ImageUploader value={props.warrantyCard.receive_bill_image} />
                  </section>
               </main>
            </article>
         )}
      </Drawer>
   )
}

export default Task_WarrantyReceive_ResolveWarrantyFailedDrawer
export type { Task_WarrantyReceive_ResolveWarrantyFailedDrawerProps }
