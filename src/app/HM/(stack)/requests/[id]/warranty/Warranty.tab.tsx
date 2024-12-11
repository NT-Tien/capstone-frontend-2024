"use client"

import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { Factory } from "@phosphor-icons/react"
import { UseQueryResult } from "@tanstack/react-query"
import { Space, Divider, Button } from "antd"
import Image from "next/image"
import { EyeOutlined, EditOutlined } from "@ant-design/icons"
import { useMemo } from "react"
import { DeviceWarrantyCardStatus } from "@/lib/domain/DeviceWarrantyCard/DeviceWarrantyCardStatus.enum"
import ImageUploader from "@/components/ImageUploader"
import VideoUploader from "@/components/VideoUploader"
import dayjs from "dayjs"

type Props = {
   api_request: UseQueryResult<RequestDto, Error>
}

function WarrantyTab(props: Props) {
   const activeWarrantyCard = useMemo(() => {
      if (!props.api_request.isSuccess) return

      return props.api_request.data.deviceWarrantyCards?.find(
         (card) => card.status !== DeviceWarrantyCardStatus.SUCCESS && card.status !== DeviceWarrantyCardStatus.FAIL,
      )
   }, [props.api_request.data?.deviceWarrantyCards, props.api_request.isSuccess])

   return (
      <div className="p-layout pb-[80px]">
         {props.api_request.data?.temporary_replacement_device && (
            <div className="mb-layout">
               <div className="w-max rounded-t-lg border-2 border-b-0 border-red-800 bg-neutral-100 px-8 font-semibold text-red-800">
                  Thiết bị thay thế tạm thời
               </div>
               <div className="flex h-[76px]">
                  <div className="flex w-full flex-grow items-start justify-start gap-3 rounded-bl-lg bg-red-800 p-2">
                     <div className="flex-shrink-0">
                        <Image
                           src={props.api_request.data.temporary_replacement_device.machineModel.image}
                           alt="device-image"
                           width={60}
                           height={60}
                           className="rounded-md"
                        />
                     </div>
                     <div className="flex flex-col text-white">
                        <h3 className="line-clamp-1 whitespace-pre-wrap text-base font-bold">
                           {props.api_request.data.temporary_replacement_device.machineModel.name}
                        </h3>
                        <Space split={<Divider type="vertical" className="m-0" />} className="mt-auto">
                           <div className="text-xs">
                              <Factory size={14} weight="fill" className="mr-1.5 inline" />
                              {props.api_request.data.temporary_replacement_device.machineModel.manufacturer}
                           </div>
                        </Space>
                     </div>
                  </div>
                  <div className="flex h-full flex-shrink-0 flex-col">
                     <Button
                        icon={<EyeOutlined />}
                        className="h-full rounded-l-none rounded-br-none border-red-800"
                     ></Button>
                     <Button
                        icon={<EditOutlined />}
                        className="h-full rounded-l-none rounded-tr-none border-red-800"
                     ></Button>
                  </div>
               </div>
            </div>
         )}

         <article className="mb-3">
            <header>
               <h2 className="text-lg font-bold">Thông tin lỗi máy</h2>
            </header>
            <main className="space-y-3">
               <section>
                  <h3 className="mb-0.5 text-base font-semibold text-neutral-800">Ghi chú</h3>
                  <p>{activeWarrantyCard?.initial_note}</p>
               </section>
               {activeWarrantyCard?.initial_images && (
                  <section>
                     <h3 className="mb-0.5 text-base font-semibold text-neutral-800">Hình ảnh lỗi</h3>
                     <ImageUploader value={activeWarrantyCard.initial_images} />
                  </section>
               )}
               {activeWarrantyCard?.initial_video && (
                  <section>
                     <h3 className="mb-0.5 text-base font-semibold text-neutral-800">Video lỗi</h3>
                     <VideoUploader value={[activeWarrantyCard.initial_video]} />
                  </section>
               )}
            </main>
         </article>
         {activeWarrantyCard?.status === DeviceWarrantyCardStatus.WC_PROCESSING && (
            <article className="mb-3">
               <header>
                  <h2 className="text-lg font-bold">Đơn gửi bảo hành</h2>
               </header>
               <main className="space-y-3">
                  <section>
                     <h3 className="mb-0.5 text-base font-semibold text-neutral-800">Mã đơn bảo hành</h3>
                     <p>{activeWarrantyCard.code}</p>
                  </section>
                  <section>
                     <h3 className="mb-0.5 text-base font-semibold text-neutral-800">Ngày gửi</h3>
                     <p>{dayjs(activeWarrantyCard.send_date).format("DD/MM/YYYY HH:mm")}</p>
                  </section>
                  <section>
                     <h3 className="mb-0.5 text-base font-semibold text-neutral-800">Ngày nhận (dự tính)</h3>
                     <p>{dayjs(activeWarrantyCard.receive_date).format("DD/MM/YYYY")}</p>
                  </section>
                  <section>
                     <h3 className="mb-0.5 text-base font-semibold text-neutral-800">Nhân viện nhận máy</h3>
                     <p>{activeWarrantyCard.wc_receiverName}</p>
                  </section>
                  <section>
                     <h3 className="mb-0.5 text-base font-semibold text-neutral-800">Số điện thoại liên lạc</h3>
                     <p>{activeWarrantyCard.wc_receiverPhone}</p>
                  </section>
                  <section>
                     <h3 className="mb-0.5 text-base font-semibold text-neutral-800">Vị trí trung tâm bảo hành</h3>
                     <p>
                        {activeWarrantyCard.wc_name} -{" "}
                        {[
                           activeWarrantyCard.wc_address_1,
                           activeWarrantyCard.wc_address_2,
                           "Phường " + activeWarrantyCard.wc_address_ward,
                           "Quận " + activeWarrantyCard.wc_address_district,
                           activeWarrantyCard.wc_address_city,
                        ].join(", ")}
                     </p>
                  </section>
               </main>
            </article>
         )}
      </div>
   )
}

export default WarrantyTab
