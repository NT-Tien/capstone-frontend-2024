"use client"

import AlertCard from "@/components/AlertCard"
import ImageUploader from "@/components/ImageUploader"
import { CreateSignatureDrawerRefType } from "@/components/overlays/CreateSignature.drawer"
import SignatureUploader from "@/components/SignatureUploader"
import { File_Image_Upload } from "@/features/common/api/file/upload_image.api"
import staff_mutations from "@/features/staff/mutations"
import { ReturnToWarehouseTypeErrorId } from "@/lib/constants/Warranty"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { TaskDto, TaskType } from "@/lib/domain/Task/Task.dto"
import { CloseOutlined, MoreOutlined } from "@ant-design/icons"
import { useMutation } from "@tanstack/react-query"
import { Button, Checkbox, Descriptions, Divider, Drawer, DrawerProps, Input } from "antd"
import dayjs from "dayjs"
import { useEffect, useMemo, useRef, useState } from "react"

type FinishTaskDrawerProps = {
   task?: TaskDto
   onSuccess?: () => void
}
type Props = Omit<DrawerProps, "children"> & FinishTaskDrawerProps

function FinishTaskDrawer(props: Props) {
   const [signatureVerification, setSignatureVerification] = useState<string | undefined>()
   const [imagesVerification, setImagesVerification] = useState<string[]>([])
   const [note, setNote] = useState<string>("")
   const [signed, setSigned] = useState<boolean>(false)

   const mutate_finishTask = staff_mutations.task.finish()

   const isWarranty_Special = useMemo(() => {
      if (!props.task) return false
      return (
         props.task.type === TaskType.WARRANTY_RECEIVE &&
         props.task.issues.some((i) => i.typeError.id === ReturnToWarehouseTypeErrorId)
      )
   }, [props.task])

   function handleFinish(taskId: string, imageVerify: string, signVerify: string, note: string) {
      mutate_finishTask.mutate(
         {
            id: taskId,
            autoClose: isWarranty_Special,
            payload: {
               imagesVerify: [signVerify, imageVerify],
               fixerNote: note,
               videosVerify: "",
            },
         },
         {
            onSuccess: props.onSuccess,
         },
      )
   }

   const issueStatusCounts = useMemo(() => {
      const result: {
         [key in IssueStatusEnum]: number
      } = {
         [IssueStatusEnum.RESOLVED]: 0,
         [IssueStatusEnum.FAILED]: 0,
         [IssueStatusEnum.PENDING]: 0,
         [IssueStatusEnum.CANCELLED]: 0,
      }
      if (!props.task) return result

      props.task.issues.forEach((i) => {
         result[i.status] += 1
      })

      return result
   }, [props.task])

   useEffect(() => {
      if (!props.open) {
         setImagesVerification([])
         setSignatureVerification(undefined)
      }
   }, [props.open])

   useEffect(() => {
      if (imagesVerification.length === 0) {
         setSignatureVerification(undefined)
         setSigned(false)
      }
   }, [imagesVerification])

   return (
      <>
         <Drawer
            title={
               <div className={"flex items-center justify-between"}>
                  <Button icon={<CloseOutlined className={"text-white"} />} type={"text"} onClick={props.onClose} />
                  <h1>Hoàn thành tác vụ</h1>
                  <Button icon={<MoreOutlined className={"text-white"} />} type={"text"} />
               </div>
            }
            classNames={{
               header: "bg-staff text-white",
               footer: "p-layout",
            }}
            closeIcon={false}
            placement="bottom"
            height="100%"
            footer={
               <div>
                  <div className="mb-3 flex items-start gap-3">
                     <Checkbox
                        id="sign"
                        checked={signed}
                        onChange={(e) => setSigned(e.target.checked)}
                        disabled={!signatureVerification || !imagesVerification.length}
                     />
                     <label htmlFor="sign" className={"font-bold"}>
                        Tôi muốn hoàn thành tác vụ này
                     </label>
                  </div>
                  <Button
                     block
                     type="primary"
                     size="large"
                     onClick={() =>
                        signatureVerification &&
                        props.task &&
                        imagesVerification.length &&
                        handleFinish(props.task?.id, imagesVerification[0], signatureVerification, note)
                     }
                     disabled={!signed}
                  >
                     Hoàn thành
                  </Button>
               </div>
            }
            {...props}
         >
            <AlertCard type="info" text="Vui lòng kiểm tra các thông tin sau trước khi hoàn thành tác vụ" />
            <Descriptions
               contentStyle={{
                  display: "flex",
                  justifyContent: "end",
               }}
               className="mt-4"
               colon={false}
               size="small"
               items={[
                  {
                     label: "Số lượng thành công",
                     children: issueStatusCounts.RESOLVED,
                  },
                  {
                     label: "Số lượng thất bại",
                     children: issueStatusCounts.FAILED,
                  },
                  { label: "Thời gian hoàn thành", children: dayjs().format("HH:mm DD/MM/YYYY") },
                  {
                     label: "Ghi chú:",
                     className: "*:flex-col",
                     children: (
                        <Input.TextArea
                           value={note}
                           onChange={(e) => setNote(e.target.value)}
                           placeholder="Vui lòng nhập ghi chú"
                           rows={3}
                           className="mt-2 w-full"
                           maxLength={300}
                           showCount
                        />
                     ),
                  },
               ]}
            />
            <Divider className="mt-layout" />
            <section className="mt-layout">
               <header className="mb-2">
                  <h3 className="text-base font-semibold">Hình ảnh xác nhận</h3>
                  <p className="font-base text-sm text-neutral-500">Vui lòng chụp hình trưởng phòng</p>
               </header>
               <ImageUploader value={imagesVerification} onChange={setImagesVerification} maxCount={1} />
            </section>
            <Divider className="mt-layout" />
            <section>
               <header className="mb-2">
                  <h3 className="text-base font-semibold">Chữ ký xác nhận</h3>
                  <p className="font-base text-sm text-neutral-500">Vui lòng đưa thiết bị cho trưởng phòng ký</p>
               </header>
               <SignatureUploader
                  signature={signatureVerification}
                  setSignature={setSignatureVerification}
                  disabled={!imagesVerification.length}
               >
                  <SignatureUploader.Head_Department />
               </SignatureUploader>
            </section>
         </Drawer>
      </>
   )
}

export default FinishTaskDrawer
export type { FinishTaskDrawerProps }
