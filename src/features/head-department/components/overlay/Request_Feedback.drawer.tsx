import ClickableArea from "@/components/ClickableArea"
import head_department_mutations from "@/features/head-department/mutations"
import head_department_queries from "@/features/head-department/queries"
import { FeedbackRating } from "@/lib/domain/Feedback/FeedbackRating.enum"
import { cn } from "@/lib/utils/cn.util"
import { CloseOutlined, SendOutlined } from "@ant-design/icons"
import { ThumbsDown, ThumbsUp } from "@phosphor-icons/react"
import { App, Button, Drawer, DrawerProps, Form, Input } from "antd"
import { useState } from "react"

type FieldType = {
   content: string
}

type Request_FeedbackDrawerProps = {
   requestId?: string
   onSuccess?: (rating: FeedbackRating) => void
}
type Props = Omit<DrawerProps, "children"> & Request_FeedbackDrawerProps

function Request_FeedbackDrawer(props: Props) {
   const mutate_feedbackRequest = head_department_mutations.request.feedback()

   const { message } = App.useApp()
   const [form] = Form.useForm<FieldType>()

   const [selectedRating, setSelectedRating] = useState<FeedbackRating | null>(null)

   function handleSelectRating(rating: FeedbackRating) {
      form.resetFields()
      form.setFieldsValue({ content: "" })
      setSelectedRating(rating)
   }

   function handleFinish(rating: FeedbackRating, content: string, requestId: string) {
      mutate_feedbackRequest.mutate(
         {
            id: requestId,
            payload: {
               content,
               rating,
            },
         },
         {
            onSuccess: () => {
               props.onSuccess?.(rating)
            },
         },
      )
   }

   return (
      <Drawer
         title={
            <div className="flex">
               <header className="mr-auto">
                  <h1 className="font-bold">Đánh giá</h1>
                  <p className="text-sm font-normal">Vui lòng đánh giá quá trình xử lý yêu cầu</p>
               </header>
               <Button icon={<CloseOutlined />} type="text" onClick={props.onClose} />
            </div>
         }
         placement="bottom"
         height={"max-content"}
         closeIcon={false}
         footer={
            selectedRating && (
               <Button block type="primary" icon={<SendOutlined />} onClick={form.submit}>
                  Gửi
               </Button>
            )
         }
         classNames={{
            footer: "p-layout",
            body: "pt-4",
            header: "border-b-0 pb-0",
         }}
         {...props}
         afterOpenChange={(open) => {
            props.afterOpenChange?.(open)

            if (!open) {
               setSelectedRating(null)
               form.resetFields()
            }
         }}
      >
         <section className="grid grid-cols-2 gap-3">
            <ClickableArea
               className={cn(
                  "flex aspect-square w-full flex-col items-center justify-center gap-1 border-2 border-green-500 p-2 text-green-500 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50",
                  selectedRating === FeedbackRating.PROBLEM_FIXED && "bg-green-500 text-white",
               )}
               onClick={() => {
                  handleSelectRating(FeedbackRating.PROBLEM_FIXED)
               }}
            >
               <ThumbsUp size={40} />
               <h1 className="whitespace-pre-wrap font-bold">Xử lý tốt</h1>
               <div className="whitespace-pre-wrap text-center text-xs">Vấn đề ban đầu đã được giải quyết</div>
            </ClickableArea>
            <ClickableArea
               className={cn(
                  "flex aspect-square w-full flex-col items-center justify-center gap-1 border-2 border-red-500 p-2 text-red-500 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50",
                  selectedRating === FeedbackRating.PROBLEM_NOT_FIXED && "bg-red-500 text-white",
               )}
               onClick={() => {
                  handleSelectRating(FeedbackRating.PROBLEM_NOT_FIXED)
               }}
            >
               <ThumbsDown size={40} />
               <h1 className="whitespace-pre-wrap font-bold">Xử lý chưa tốt</h1>
               <div className="whitespace-pre-wrap text-center text-xs">Vấn đề ban đầu cần xử lý thêm</div>
            </ClickableArea>
         </section>

         <section className="mb-2 mt-4">
            <header className="mb-2">
               <h2 className="text-base font-medium">
                  Ghi chú thêm{" "}
                  {selectedRating === FeedbackRating.PROBLEM_NOT_FIXED ? (
                     <div className="inline text-neutral-500">(bắt buộc)</div>
                  ) : (
                     ""
                  )}
               </h2>
               <p className="font-base text-sm text-neutral-500">Vui lòng nhập ghi chú thêm</p>
            </header>
            <Form<FieldType>
               form={form}
               onFinish={(values) =>
                  selectedRating && props.requestId && handleFinish(selectedRating, values.content, props.requestId)
               }
               onFinishFailed={() => {
                  message.destroy("errormsg")
                  message.error({
                     key: "errormsg",
                     content: "Vui lòng nhập đầy đủ thông tin",
                  })
               }}
            >
               <Form.Item<FieldType>
                  name="content"
                  rules={[{ required: selectedRating === FeedbackRating.PROBLEM_NOT_FIXED }]}
                  noStyle
               >
                  <Input.TextArea disabled={!selectedRating} rows={3} maxLength={600} showCount placeholder="Ghi chú" />
               </Form.Item>
            </Form>
         </section>
      </Drawer>
   )
}

export default Request_FeedbackDrawer
export type { Request_FeedbackDrawerProps }
