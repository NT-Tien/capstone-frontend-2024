"use client"

import { Button, Descriptions, Divider, Drawer, DrawerProps, Form, Image, Input } from "antd"
import AlertCard from "@/components/AlertCard"
import dayjs from "dayjs"
import CreateSignatureDrawer, { CreateSignatureDrawerRefType } from "@/components/overlays/CreateSignature.drawer"
import { useEffect, useMemo, useRef, useState } from "react"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import CaptureImageDrawer from "@/features/staff/components/overlays/CaptureImage.drawer"
import { useMutation } from "@tanstack/react-query"
import { File_Image_Upload } from "@/features/common/api/file/upload_image.api"
import { clientEnv } from "@/env"
import staff_mutations from "@/features/staff/mutations"
import { useRouter } from "next/navigation"

type FinishTaskDrawerProps = {
   task?: TaskDto
}
type Props = Omit<DrawerProps, "children"> & FinishTaskDrawerProps

function FinishTaskDrawer(props: Props) {
   const router = useRouter()

   const control_createSignatureDrawer = useRef<CreateSignatureDrawerRefType | null>(null)
   const [captureImageOpen, setCaptureImageOpen] = useState(false)
   const [imageVerification, setImageVerification] = useState<string | undefined>()
   const [signatureVerification, setSignatureVerification] = useState<string | undefined>()
   const [note, setNote] = useState<string>("")

   const mutate_uploadImage = useMutation({
      mutationFn: File_Image_Upload,
   })

   const mutate_finishTask = staff_mutations.task.finish()

   function handleFinish(taskId: string, imageVerify: string, signVerify: string, note: string) {
      mutate_finishTask.mutate(
         {
            id: taskId,
            payload: {
               imagesVerify: [signVerify, imageVerify],
               fixerNote: note,
               videosVerify: "",
            },
         },
         {
            onSuccess: () => {
               router.push("/staff/tasks")
            },
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
      }
      if (!props.task) return result

      props.task.issues.forEach((i) => {
         result[i.status] += 1
      })

      return result
   }, [props.task])

   useEffect(() => {
      if (!props.open) {
         setImageVerification(undefined)
         setSignatureVerification(undefined)
      }
   }, [props.open])

   return (
      <>
         <Drawer
            title="Hoàn thành tác vụ"
            placement="bottom"
            height="max-content"
            classNames={{
               footer: "p-layout",
            }}
            footer={
               <Button
                  block
                  type="primary"
                  size="large"
                  onClick={() =>
                     handleFinish(props.task?.id ?? "", imageVerification ?? "", signatureVerification ?? "", note)
                  }
                  disabled={!imageVerification || !signatureVerification || !props.task}
               >
                  Hoàn thành
               </Button>
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
               ]}
            />
            <section className="mt-3">
               <Form.Item label={<div className="text-neutral-500">Ghi chú</div>} layout="vertical">
                  <Input.TextArea
                     value={note}
                     onChange={(e) => setNote(e.target.value)}
                     placeholder="Vui lòng nhập ghi chú sau sửa chữa"
                     rows={3}
                     maxLength={300}
                     showCount
                  />
               </Form.Item>
            </section>
            <Divider className="mt-12 text-base font-semibold">Xác nhận hoàn thành</Divider>
            <section className="grid grid-cols-2 gap-3">
               {imageVerification ? (
                  <Image
                     alt="image"
                     key={imageVerification + "_image"}
                     src={clientEnv.BACKEND_URL + "/file-image/" + imageVerification}
                     className="aspect-square w-full rounded-lg"
                  />
               ) : (
                  <Button block className="aspect-square h-max" onClick={() => setCaptureImageOpen(true)}>
                     <div className="whitespace-pre-wrap">Thêm hình ảnh trưởng phòng</div>
                  </Button>
               )}
               {signatureVerification ? (
                  <Image
                     alt="image"
                     key={signatureVerification + "_image"}
                     src={clientEnv.BACKEND_URL + "/file-image/" + signatureVerification}
                     className="aspect-square w-full rounded-lg"
                  />
               ) : (
                  <Button
                     block
                     className="aspect-square h-max"
                     onClick={() => control_createSignatureDrawer.current?.handleOpen()}
                  >
                     <div className="whitespace-pre-wrap">Thêm chữ ký xác nhận</div>
                  </Button>
               )}
            </section>
         </Drawer>
         <CaptureImageDrawer
            open={captureImageOpen}
            onClose={() => setCaptureImageOpen(false)}
            onCapture={async (file) => {
               const result = await mutate_uploadImage.mutateAsync({ file })
               setImageVerification(result.data.path)
               setCaptureImageOpen(false)
            }}
         />
         <CreateSignatureDrawer
            onSubmit={(result) => {
               setSignatureVerification(result)
               control_createSignatureDrawer.current?.handleClose()
            }}
            ref={control_createSignatureDrawer}
         />
      </>
   )
}

export default FinishTaskDrawer
export type { FinishTaskDrawerProps }
