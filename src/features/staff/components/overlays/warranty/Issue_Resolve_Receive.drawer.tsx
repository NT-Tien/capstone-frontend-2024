import ImageUploader from "@/components/ImageUploader"
import Steps from "@/components/Steps"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { CloseOutlined, LeftOutlined, MoreOutlined, RightOutlined, SendOutlined } from "@ant-design/icons"
import { Images, Note } from "@phosphor-icons/react"
import { Button, Drawer, DrawerProps, Input, Radio } from "antd"
import { useState } from "react"

type Step1_ValuesType = {
   receive_note: string
   warranty_status?: "success" | "fail"
}
function validateStep1(values: Step1_ValuesType) {
   return Object.values(values).every((value) => value.trim().length > 0)
}

type Step2_ValuesType = {
   receipt_images: string[]
}
function validateStep2(values: Step2_ValuesType) {
   return values.receipt_images.length > 0
}

type Issue_Resolve_ReceiveDrawerProps = {
   issue?: IssueDto
   onSuccess?: (values: Step1_ValuesType & Step2_ValuesType) => void
}
type Props = Omit<DrawerProps, "children"> &
   Issue_Resolve_ReceiveDrawerProps & {
      handleClose?: () => void
   }

function Issue_Resolve_ReceiveDrawer(props: Props) {
   const [step, setStep] = useState(0)
   const [step1Values, setStep1Values] = useState<Step1_ValuesType>({
      receive_note: "",

   })
   const [step2Values, setStep2Values] = useState<Step2_ValuesType>({
      receipt_images: [],
   })

   function Footer() {
      if (step === 0) {
         return (
            <div className="grid w-full grid-cols-12">
               <Steps
                  className="col-span-9 justify-start"
                  items={[
                     {
                        name: "Thông tin bảo hành",
                        status: "current",
                        onClick: () => {},
                     },
                     {
                        name: "Xác minh thông tin",
                        status: "upcoming",
                        onClick: () => {},
                     },
                  ]}
               />
               <Button
                  icon={<RightOutlined />}
                  iconPosition="end"
                  type="primary"
                  className="col-span-3"
                  disabled={validateStep1(step1Values) === false}
                  onClick={() => setStep(1)}
               >
                  Tiếp
               </Button>
            </div>
         )
      }

      if (step === 1) {
         return (
            <div className="grid w-full grid-cols-12">
               <Button icon={<LeftOutlined />} type="default" onClick={() => setStep(0)}></Button>
               <Steps
                  className="col-span-8"
                  items={[
                     {
                        name: "Thông tin bảo hành",
                        status: "complete",
                        onClick: () => {},
                     },
                     {
                        name: "Xác minh thông tin",
                        status: "current",
                        onClick: () => {},
                     },
                  ]}
               />
               <Button
                  icon={<SendOutlined />}
                  iconPosition="end"
                  type="primary"
                  className="col-span-3"
                  disabled={validateStep2(step2Values) === false}
                  onClick={() =>
                     validateStep1(step1Values) &&
                     validateStep2(step2Values) &&
                     props.onSuccess?.({ ...step1Values, ...step2Values })
                  }
               >
                  Gửi
               </Button>
            </div>
         )
      }
   }

   return (
      <Drawer
         title={
            <div>
               <div className={"flex items-center justify-between"}>
                  <Button icon={<CloseOutlined className={"text-white"} />} type={"text"} onClick={props.onClose} />
                  <h1>Hoàn thành bước</h1>
                  <Button icon={<MoreOutlined className={"text-white"} />} type={"text"} />
               </div>
            </div>
         }
         classNames={{
            header: "bg-staff text-white",
            footer: "p-layout",
         }}
         closeIcon={false}
         placement={"bottom"}
         height="100%"
         loading={!props.issue}
         footer={<Footer />}
         {...props}
      >
         {step === 0 && (
            <section>
               <header className="mb-2 rounded-lg bg-orange-50 p-3 text-center">
                  <h1 className="mb-0.5 flex items-center justify-center gap-1 text-base font-medium">
                     <Note size={18} weight="fill" />
                     Thông tin trả máy
                  </h1>
                  <p className="text-sm text-neutral-500">Vui lòng điền thông tin trả máy phía dưới</p>
               </header>

               <main className="mt-3 flex flex-col gap-4">
                  <section>
                     <label className="text-sm text-neutral-600">Trạng thái bảo hành</label>
                     <Radio.Group
                        className="mt-1 space-y-2"
                        value={step1Values.warranty_status}
                        onChange={(e) => setStep1Values((prev) => ({ ...prev, warranty_status: e.target.value }))}
                     >
                        <Radio value="success" className="text-sm">
                           Bảo hành thành công
                        </Radio>
                        <Radio value="fail" className="text-sm">
                           Từ chối bảo hành
                        </Radio>
                     </Radio.Group>
                  </section>
                  {step1Values.warranty_status === "success" && (
                     <>
                        <section>
                           <label className="text-sm text-neutral-600">Thông tin đính kèm</label>
                           <Input.TextArea
                              className="mt-1"
                              rows={3}
                              showCount
                              maxLength={500}
                              placeholder="Vui lòng sử dụng thiết bị cẩn thận. Không tháo gỡ đinh vít thiết bị."
                              value={step1Values.receive_note}
                              onChange={(e) =>
                                 setStep1Values((values) => ({ ...values, receive_note: e.target.value }))
                              }
                           />
                        </section>
                     </>
                  )}
                  {step1Values.warranty_status === "fail" && (
                     <>
                        <section>
                           <label className="text-sm text-neutral-600">Lý do từ chối</label>
                           <Input.TextArea
                              className="mt-1"
                              rows={3}
                              showCount
                              maxLength={500}
                              placeholder="Thiết bị bị nổ động cơ. Bên trung tâm từ chối bảo hành."
                              value={step1Values.receive_note}
                              onChange={(e) =>
                                 setStep1Values((values) => ({ ...values, receive_note: e.target.value }))
                              }
                           />
                        </section>
                     </>
                  )}
               </main>
            </section>
         )}
         {step === 1 && (
            <section>
               <header className="mb-2 rounded-lg bg-orange-50 p-3 text-center">
                  <h1 className="mb-0.5 flex items-center justify-center gap-1 text-base font-medium">
                     <Images size={18} weight="fill" />
                     Hình ảnh xác nhận
                  </h1>
                  <p className="text-sm text-neutral-500">Vui lòng tải hình ảnh xác nhận bảo hành</p>
               </header>
               <main className="mt-3 flex flex-col gap-4">
                  <section>
                     <label className="text-sm text-neutral-600">Hình ảnh biên nhận</label>
                     <ImageUploader
                        className="mt-2"
                        value={step2Values.receipt_images}
                        onChange={(img) => setStep2Values((values) => ({ ...values, receipt_images: img }))}
                     />
                  </section>
               </main>
            </section>
         )}
      </Drawer>
   )
}

export default Issue_Resolve_ReceiveDrawer
export type { Issue_Resolve_ReceiveDrawerProps }
