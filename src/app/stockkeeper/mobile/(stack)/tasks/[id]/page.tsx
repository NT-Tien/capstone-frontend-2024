"use client"

import { stockkeeper_qk } from "@/app/stockkeeper/_api/qk"
import Stockkeeper_Task_GetById from "@/app/stockkeeper/_api/task/getById.api"
import PageHeader from "@/components/layout/PageHeader"
import { TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import { RightOutlined } from "@ant-design/icons"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, Divider, Spin, Tag } from "antd"
import dayjs from "dayjs"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Fragment, useMemo, useRef } from "react"
import SparePartDetailsDrawer, { SparePartDetailsDrawerRefType } from "./SparePartDetails.drawer"
import { IssueSparePartDto } from "@/lib/domain/IssueSparePart/IssueSparePart.dto"

function Page({ params }: { params: { id: string } }) {
   const router = useRouter()
   const sparePartDetailsDrawerRef = useRef<SparePartDetailsDrawerRefType | null>(null)
   const queryClient = useQueryClient()

   const api_task = useQuery({
      queryKey: stockkeeper_qk.tasks.one_byId(params.id),
      queryFn: () => Stockkeeper_Task_GetById({ id: params.id }),
      select: (data) => {
         console.log("INITIA:L")
         console.log(data)
         return data
      },
   })

   const spareParts = useMemo(() => {
      let returnValue: {
         [id: string]: IssueSparePartDto
      } = {}

      const issues = api_task.data?.issues

      issues?.forEach((issue) => {
         issue.issueSpareParts.forEach((isp, index) => {
            console.log(isp)
            if (!returnValue[isp.sparePart.id]) {
               returnValue[isp.sparePart.id] = isp
            } else {
               returnValue[isp.sparePart.id].quantity += isp.quantity
            }
         })
      })

      const values = Object.values(returnValue)
      console.log(values)

      const spareParts = values.sort((a, b) => {
         if (a.sparePart.quantity < a.quantity) return -1
         if (b.sparePart.quantity > b.quantity) return 1
         return 0
      })

      return spareParts
   }, [api_task.data?.issues])

   const missingSpareParts = useMemo(() => {
      return spareParts?.filter((item) => item.sparePart.quantity < item.quantity)
   }, [spareParts])

   return (
      <div className="std-layout relative">
         <PageHeader
            title={"Tác vụ"}
            handleClickIcon={() => router.back()}
            icon={PageHeader.BackIcon}
            className="std-layout-outer relative z-30"
         />
         <Image
            className="std-layout-outer absolute h-32 w-full object-cover opacity-40"
            src="/images/requests.jpg"
            alt="image"
            width={784}
            height={100}
            style={{
               WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
               maskImage: "linear-gradient(to top, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1) 90%)",
            }}
         />

         {api_task.isPending && (
            <div className="z-50 grid place-items-center py-32" key="api_task_pending">
               <Spin />
            </div>
         )}

         {api_task.isSuccess && (
            <>
               <section id="task-details" key="task-details" className="z-50 rounded-lg bg-white">
                  <div className="flex items-center justify-between p-3">
                     <h2 className="text-base font-medium text-gray-800">Tên tác vụ</h2>
                     <span className="text-sm text-gray-500">{api_task.data?.name}</span>
                  </div>
                  <Divider className="my-0" />
                  <div className="flex items-center justify-between p-3">
                     <h2 className="text-base font-medium text-gray-800">Độ ưu tiên</h2>
                     <span className="text-sm text-gray-500">
                        {api_task.data?.priority ? "Ưu tiên" : "Bình thường"}
                     </span>
                  </div>
                  <Divider className="my-0" />
                  <div className="flex items-center justify-between p-3">
                     <h2 className="text-base font-medium text-gray-800">Ngày sửa chữa</h2>
                     <span className="text-sm text-gray-500">
                        {api_task.data.fixerDate
                           ? dayjs(api_task.data?.fixerDate).add(7, "hours").format("DD/MM/YYYY")
                           : "Chưa xác định"}
                     </span>
                  </div>
                  <Divider className="my-0" />
                  <div className="flex items-center justify-between p-3">
                     <h2 className="text-base font-medium text-gray-800">Trạng thái</h2>
                     <span className="text-sm text-gray-500">
                        <Tag color={TaskStatusTagMapper[api_task.data.status as any].colorInverse} className="m-0">
                           {TaskStatusTagMapper[api_task.data.status as any].text}
                        </Tag>
                     </span>
                  </div>
               </section>
               <section id="spare-parts" key="spare-parts" className="mt-6">
                  <div className="mb-2 flex items-center justify-between">
                     <h2 className="text-base font-medium text-gray-800">Linh kiện còn thiếu</h2>
                     <span className="text-sm text-gray-500">{missingSpareParts?.length}</span>
                  </div>
                  <div className="z-50 rounded-lg bg-white">
                     {spareParts?.map((item, index) => (
                        <Fragment key={item.id}>
                           <div
                              className={cn(
                                 "flex cursor-pointer items-center justify-between p-3 pr-1",
                                 item.quantity <= item.sparePart.quantity && "opacity-50",
                              )}
                              onClick={() => {
                                 sparePartDetailsDrawerRef.current?.handleOpen(item)
                              }}
                           >
                              <div>
                                 <h2 className="text-base font-medium text-gray-800">{item.sparePart.name}</h2>
                                 <div className="text-sm font-light text-neutral-600">
                                    <span className={cn(item.sparePart.quantity < item.quantity && "text-red-500")}>
                                       Trong kho: {item.sparePart.quantity}
                                    </span>{" "}
                                    • Cần: {item.quantity}
                                 </div>
                              </div>
                              <div>
                                 <Button size="large" type="text" icon={<RightOutlined />} iconPosition="end">
                                    <span className="text-sm text-neutral-500">Cập nhật</span>
                                 </Button>
                              </div>
                           </div>
                           {index !== spareParts.length - 1 && <Divider className="my-0" />}
                        </Fragment>
                     ))}
                  </div>
               </section>
            </>
         )}
         <SparePartDetailsDrawer
            ref={sparePartDetailsDrawerRef}
            refetchFn={async () => {
               const task = await api_task.refetch()
               await queryClient.invalidateQueries({
                  queryKey: stockkeeper_qk.tasks.base,
                  exact: false,
                  refetchType: "all",
               })

               if (
                  !!task.data?.issues.find((issue) =>
                     issue.issueSpareParts.some((item) => item.quantity > item.sparePart.quantity),
                  ) === false
               ) {
                  router.push("/stockkeeper/mobile/tasks")
               }
            }}
         />
      </div>
   )
}

export default Page
