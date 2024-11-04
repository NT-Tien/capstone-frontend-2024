"use client"

import { Button, Card, DatePicker, Drawer, Form, DrawerProps, Image, App, Divider, Space, Descriptions } from "antd"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { clientEnv } from "@/env"
import { Fragment, useState } from "react"
import dayjs, { Dayjs } from "dayjs"
import { ReceiveWarrantyTypeErrorId, SendWarrantyTypeErrorId } from "@/lib/constants/Warranty"
import AlertCard from "@/components/AlertCard"
import { CloseOutlined, MoreOutlined, RightOutlined } from "@ant-design/icons"
import { cn } from "@/lib/utils/cn.util"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/lib/domain/Issue/IssueStatus.enum"
import { CheckCircle, CircleDashed, MinusCircle, XCircle } from "@phosphor-icons/react"
import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"

type Task_VerifyComplete_WarrantyDrawerProps = {
   task?: TaskDto
   onSubmit?: () => void
}
type Props = Omit<DrawerProps, "children"> &
   Task_VerifyComplete_WarrantyDrawerProps & {
      handleClose?: () => void
   }

function Task_VerifyComplete_WarrantyDrawer(props: Props) {
   function handleSubmit() {
      props.onSubmit?.()
      props.handleClose?.()
   }

   return (
      <Drawer
         title={
            <div className={"flex items-center justify-between"}>
               <Button icon={<CloseOutlined className={"text-white"} />} type={"text"} onClick={props.onClose} />
               <h1>Kiểm tra tác vụ</h1>
               <Button icon={<MoreOutlined className={"text-white"} />} type={"text"} />
            </div>
         }
         closeIcon={false}
         height="100%"
         placement="bottom"
         footer={
            <Button size="large" block type="primary" onClick={handleSubmit}>
               Xác nhận thông tin
            </Button>
         }
         classNames={{ footer: "p-layout", header: "bg-head_maintenance text-white" }}
         {...props}
      >
         <Descriptions
            size={"small"}
            contentStyle={{
               display: "flex",
               justifyContent: "flex-end",
            }}
            items={[
               {
                  label: "Thời gian hoàn thành",
                  children: props.task?.completedAt ? dayjs(props.task.completedAt).format("HH:mm DD/MM/YYYY") : "-",
               },
               {
                  label: "Ghi chú",
                  children: props.task?.fixerNote || "Không có",
               },
               {
                  label: "Biên lai bảo hành",
                  className: "*:flex-col",
                  children: (
                     <div className="mt-3 grid grid-cols-4 gap-3">
                        {props.task?.issues
                           .find(
                              (i) =>
                                 i.typeError.id === SendWarrantyTypeErrorId ||
                                 i.typeError.id === ReceiveWarrantyTypeErrorId,
                           )
                           ?.imagesVerify.map(
                              (img) =>
                                 img && (
                                    <Image
                                       key={img}
                                       src={clientEnv.BACKEND_URL + `/file-image/${img}`}
                                       alt="Chữ ký"
                                       className="h-max w-full rounded-lg"
                                    />
                                 ),
                           )}
                     </div>
                  ),
               },
               {
                  label: "Minh chứng hoàn thành",
                  className: "*:flex-col",
                  children: (
                     <div className="mt-3 grid grid-cols-2 gap-3">
                        {props.task?.imagesVerify.map(
                           (img) =>
                              img && (
                                 <Image
                                    key={img}
                                    src={clientEnv.BACKEND_URL + `/file-image/${img}`}
                                    alt="Chữ ký"
                                    className="h-max w-full rounded-lg"
                                 />
                              ),
                        )}
                     </div>
                  ),
               },
            ]}
         />
      </Drawer>
   )
}

export default Task_VerifyComplete_WarrantyDrawer
export type { Task_VerifyComplete_WarrantyDrawerProps }
