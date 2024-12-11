import CustomDatePicker from "@/components/CustomDatePicker"
import ImageUploader from "@/components/ImageUploader"
import ViewMapModal, { ViewMapModalProps } from "@/components/overlays/ViewMap.modal"
import Steps from "@/components/Steps"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import staff_mutations from "@/features/staff/mutations"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import {
   CloseOutlined,
   LeftOutlined,
   MoreOutlined,
   PhoneOutlined,
   RightOutlined,
   SendOutlined,
   UserOutlined,
} from "@ant-design/icons"
import { IdentificationCard, Images, MapPin, Note } from "@phosphor-icons/react"
import { Button, Drawer, DrawerProps, Input, InputNumber } from "antd"
import dayjs, { Dayjs } from "dayjs"
import { useRef, useState } from "react"

type Step1_ValuesType = {
   name: string
   street1: string
   street2: string
   ward: string
   district: string
   city: string
}
function validateStep1(values: Step1_ValuesType) {
   return Object.values(values).every((value) => value.trim().length > 0)
}

type Step2_ValuesType = {
   warrantyCenter_id: string
   warrantyCenter_receiverName: string
   warrantyCenter_receiverPhone: string
   warrantyCenter_expectedReturn: Dayjs | undefined
   warrantyCenter_note: string
}
function validateStep2(values: Step2_ValuesType) {
   if (values.warrantyCenter_id.trim().length === 0 || values.warrantyCenter_receiverName.trim().length === 0)
      return false

   if (!values.warrantyCenter_expectedReturn || !values.warrantyCenter_receiverPhone) return false

   return true
}

type Step3_ValuesType = {
   receipt_images: string[]
}
function validateStep3(values: Step3_ValuesType) {
   return values.receipt_images.length > 0
}

type Issue_Resolve_SendDrawerProps = {
   requestId?: string
   issue?: IssueDto
   onSuccess?: (values: Step1_ValuesType & Step2_ValuesType & Step3_ValuesType) => void
}
type Props = Omit<DrawerProps, "children"> &
   Issue_Resolve_SendDrawerProps & {
      handleClose?: () => void
   }

function Issue_Resolve_SendDrawer(props: Props) {
   const control_viewMapModal = useRef<RefType<ViewMapModalProps>>(null)

   const [step, setStep] = useState(0)

   const [step1Values, setStep1Values] = useState<Step1_ValuesType>({
      name: "",
      street1: "",
      street2: "",
      ward: "",
      district: "",
      city: "",
   })
   const [step2Values, setStep2Values] = useState<Step2_ValuesType>({
      warrantyCenter_id: "",
      warrantyCenter_receiverName: "",
      warrantyCenter_receiverPhone: "",
      warrantyCenter_expectedReturn: undefined,
      warrantyCenter_note: "",
   })
   const [step3Values, setStep3Values] = useState<Step3_ValuesType>({
      receipt_images: [],
   })

   const mutate_resolveIssue = staff_mutations.issues.resolveSendWarranty()

   function Footer() {
      if (step === 0) {
         return (
            <div className="grid w-full grid-cols-12">
               <Steps
                  className="col-span-9 justify-start"
                  items={[
                     {
                        name: "Vị trí hiện tại",
                        status: "current",
                        onClick: () => {},
                     },
                     {
                        name: "Thông tin bảo hành",
                        status: "upcoming",
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
                        name: "Vị trí hiện tại",
                        status: "complete",
                        onClick: () => setStep(0),
                     },
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
                  onClick={() => setStep(2)}
                  className="col-span-3"
                  disabled={validateStep2(step2Values) === false}
               >
                  Tiếp
               </Button>
            </div>
         )
      }

      if (step === 2) {
         return (
            <div className="grid w-full grid-cols-12">
               <Button icon={<LeftOutlined />} type="default" onClick={() => setStep(1)}></Button>
               <Steps
                  className="col-span-8"
                  items={[
                     {
                        name: "Vị trí hiện tại",
                        status: "complete",
                        onClick: () => setStep(0),
                     },
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
                  disabled={validateStep3(step3Values) === false}
                  onClick={() =>
                     validateStep1(step1Values) &&
                     validateStep2(step2Values) &&
                     validateStep3(step3Values) &&
                     props.onSuccess?.({ ...step1Values, ...step2Values, ...step3Values })
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
                     <MapPin size={18} weight="fill" />
                     Vị trí hiện tại
                  </h1>
                  <p className="text-sm text-neutral-500">Vui lòng xác minh vị trí trung tâm bảo hành</p>
               </header>
               <main className="mt-3 flex flex-col gap-4">
                  <section>
                     <label className="text-sm text-neutral-600">Tên trung tâm bảo hành</label>
                     <Input
                        className="mt-1"
                        placeholder="Trung tâm bảo hành ABC Q1"
                        value={step1Values.name}
                        onChange={(e) => setStep1Values((values) => ({ ...values, name: e.target.value }))}
                     />
                  </section>
                  <section>
                     <label className="text-sm text-neutral-600">Số đường (dòng 1)</label>
                     <Input
                        className="mt-1"
                        placeholder="Số 12/3"
                        value={step1Values.street1}
                        onChange={(e) => setStep1Values((values) => ({ ...values, street1: e.target.value }))}
                     />
                  </section>
                  <section>
                     <label className="text-sm text-neutral-600">Số đường (dòng 2)</label>
                     <Input
                        className="mt-1"
                        placeholder="Đường Nguyễn Văn A"
                        value={step1Values.street2}
                        onChange={(e) => setStep1Values((values) => ({ ...values, street2: e.target.value }))}
                     />
                  </section>
                  <div className="flex gap-3">
                     <section>
                        <label className="text-sm text-neutral-600">Phường</label>
                        <Input
                           className="mt-1"
                           placeholder="Phường 1"
                           value={step1Values.ward}
                           onChange={(e) => setStep1Values((values) => ({ ...values, ward: e.target.value }))}
                        />
                     </section>
                     <section>
                        <label className="text-sm text-neutral-600">Quận</label>
                        <Input
                           className="mt-1"
                           placeholder="Quận 1"
                           value={step1Values.district}
                           onChange={(e) => setStep1Values((values) => ({ ...values, district: e.target.value }))}
                        />
                     </section>
                  </div>
                  <section>
                     <label className="text-sm text-neutral-600">Thành phố</label>
                     <Input
                        className="mt-1"
                        placeholder="TP.HCM"
                        value={step1Values.city}
                        onChange={(e) => setStep1Values((values) => ({ ...values, city: e.target.value }))}
                     />
                  </section>
               </main>
            </section>
         )}
         {step === 1 && (
            <section>
               <header className="mb-2 rounded-lg bg-orange-50 p-3 text-center">
                  <h1 className="mb-0.5 flex items-center justify-center gap-1 text-base font-medium">
                     <Note size={18} weight="fill" />
                     Thông tin bảo hành
                  </h1>
                  <p className="text-sm text-neutral-500">Vui lòng điền thông tin bảo hành phía dưới</p>
               </header>
               <main className="mt-3 flex flex-col gap-4">
                  <section>
                     <label className="text-sm text-neutral-600">Mã đơn bảo hành</label>
                     <Input
                        className="mt-1"
                        addonBefore={<IdentificationCard />}
                        placeholder="ABC123"
                        value={step2Values.warrantyCenter_id}
                        onChange={(e) => setStep2Values((values) => ({ ...values, warrantyCenter_id: e.target.value }))}
                     />
                  </section>
                  <section>
                     <label className="text-sm text-neutral-600">Nhân viên nhận bảo hành</label>
                     <Input
                        className="mt-1"
                        addonBefore={<UserOutlined />}
                        placeholder="Nguyễn Văn A"
                        value={step2Values.warrantyCenter_receiverName}
                        onChange={(e) =>
                           setStep2Values((values) => ({ ...values, warrantyCenter_receiverName: e.target.value }))
                        }
                     />
                  </section>
                  <section>
                     <label className="text-sm text-neutral-600">Số điện thoại bên bảo hành</label>
                     <InputNumber
                        className="mt-1 w-full"
                        addonBefore={<PhoneOutlined />}
                        placeholder="0123456789"
                        value={step2Values.warrantyCenter_receiverPhone}
                        onChange={(e) =>
                           setStep2Values((values) => ({ ...values, warrantyCenter_receiverPhone: e ?? "" }))
                        }
                     />
                  </section>
                  <section className="space-y-1">
                     <label className="text-sm text-neutral-600">Ngày nhận bảo hành (dự tính)</label>
                     <CustomDatePicker
                        bounds={{
                           min: dayjs().startOf("day"),
                           max: dayjs().add(10, "years").endOf("year"),
                        }}
                        value={step2Values.warrantyCenter_expectedReturn}
                        onChange={(date) =>
                           setStep2Values((values) => ({ ...values, warrantyCenter_expectedReturn: date }))
                        }
                     />
                  </section>
                  <section>
                     <label className="text-sm text-neutral-600">Thông tin đính kèm</label>
                     <Input.TextArea
                        className="mt-1"
                        rows={3}
                        showCount
                        maxLength={500}
                        placeholder="TTBH sẽ gọi điện 2 ngày trước khi bảo hành xong"
                        value={step2Values.warrantyCenter_note}
                        onChange={(e) =>
                           setStep2Values((values) => ({ ...values, warrantyCenter_note: e.target.value }))
                        }
                     />
                  </section>
               </main>
            </section>
         )}
         {step === 2 && (
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
                        value={step3Values.receipt_images}
                        onChange={(img) => setStep3Values((values) => ({ ...values, receipt_images: img }))}
                     />
                  </section>
               </main>
            </section>
         )}
         {/* <section>
            <ClickableArea
               className="items-center justify-start p-3"
               block
               onClick={() => control_viewMapModal.current?.handleOpen({ coordinates: location?.coords })}
            >
               <MapPin size={32} />
               <div className="flex flex-grow flex-col items-start justify-start">
                  <h1 className="text-base font-bold">Vị trí hiện tại</h1>
                  <p className="font-base text-sm text-neutral-500">Xác minh vị trí trung tâm bảo hành</p>
               </div>
               <RightOutlined />
            </ClickableArea>
         </section>
         <section className="mt-8">
            <header className="mb-2">
               <h3 className="text-base font-semibold">Hình ảnh biên nhận</h3>
               <p className="font-base text-sm text-neutral-500">Vui lòng tải hình ảnh biên nhận bảo hành</p>
            </header>
            <ImageUploader imageUris={imageUris} setImageUris={setImageUris} />
         </section>
         <section className="mt-8">
            <header className="mb-2">
               <h3 className="text-base font-semibold">Ngày bảo hành xong</h3>
               <p className="font-base text-sm text-neutral-500">Nhập ngày dự tính bảo hành xong</p>
            </header>
            <DatePicker
               format={"dddd DD/MM/YYYY"}
               placeholder="Chọn ngày"
               className="w-full"
               minDate={dayjs().startOf("day")}
               allowClear={false}
               value={date}
               onChange={(date) => setDate(date)}
            />
         </section> */}
         <OverlayControllerWithRef ref={control_viewMapModal}>
            <ViewMapModal />
         </OverlayControllerWithRef>
      </Drawer>
   )
}

export default Issue_Resolve_SendDrawer
export type { Issue_Resolve_SendDrawerProps }
