import { App, Button, Drawer, DrawerProps, Dropdown, Form, Input, InputProps } from "antd"
import AlertCard from "@/components/AlertCard"
import { Scanner } from "@yudiel/react-qr-scanner"
import { IdcardOutlined, MoreOutlined, PhoneOutlined, SendOutlined } from "@ant-design/icons"
import { cn } from "@/lib/utils/cn.util"
import { isUUID } from "@/lib/utils/isUUID.util"
import uuidNormalizer from "@/lib/utils/uuid-normalizer.util"

type FieldType = {
   deviceId: string
}

type ScannerV3DrawerProps = {
   infoText?: string
   onScan?: (data: string) => void
   inputProps?: InputProps
}
type Props = Omit<DrawerProps, "children"> &
   ScannerV3DrawerProps & {
      handleClose?: () => void
   }

function ScannerV3Drawer(props: Props) {
   const [form] = Form.useForm<FieldType>()
   const { message } = App.useApp()

   function handleFinishScan(scannedValue: string) {
      handleFinish(scannedValue)
   }

   function handleFinishManual(values: FieldType) {
      handleFinish(values.deviceId)
   }

   function handleFinish(value: string) {
      props.onScan?.(value)
      props.handleClose?.()
   }

   return (
      <Drawer
         title={
            <div className={"flex items-center justify-between"}>
               <h1>Quét QR</h1>
               <Dropdown
                  menu={{
                     items: [
                        {
                           label: "Hỗ trợ",
                           key: "help",
                           icon: <PhoneOutlined />,
                        },
                     ],
                  }}
               >
                  <Button type={"text"} icon={<MoreOutlined />} />
               </Dropdown>
            </div>
         }
         placement={"bottom"}
         height={"max-content"}
         destroyOnClose
         classNames={{
            header: "border-b-0 pb-0",
            body: "p-layout",
         }}
         {...props}
      >
         <AlertCard type="info" className="mb-3" text={props.infoText ?? "Vui lòng đặt mã QR vào ô bên dưới"} />
         <section className={"aspect-square h-full w-full"}>
            <Scanner
               paused={!open}
               onScan={async (e) => e[0]?.rawValue && handleFinishScan(e[0].rawValue)}
               allowMultiple={true}
               scanDelay={1000}
               onError={async (e) => {
                  message.destroy("cannot-access-camera")
                  await message.error({
                     key: "cannot-access-camera",
                     content: "Không truy cập được camera. Vui lòng thử lại sau.",
                  })
               }}
               components={{ torch: true }}
            />
         </section>
         <Form<FieldType>
            form={form}
            onFinish={handleFinishManual}
            onFinishFailed={(e) => message.error(e.errorFields[0].errors[0])}
            clearOnDestroy
            validateMessages={{
               required: "Vui lòng nhập đầy đủ thông tin",
            }}
         >
            <Form.Item<FieldType>
               name={"deviceId"}
               noStyle
               rules={[
                  {
                     required: true,
                  },
                  {
                     validator: (_, value) => (isUUID(value) ? Promise.resolve() : Promise.reject("Mã không hợp lệ")),
                     validateTrigger: ["onSubmit"],
                  },
               ]}
               normalize={uuidNormalizer}
            >
               <Input.Search
                  enterButton={<Button icon={<SendOutlined />} type={"primary"} />}
                  placeholder="Nhập mã thiết bị..."
                  size="large"
                  prefix={<IdcardOutlined />}
                  onSearch={form.submit}
                  allowClear
                  {...props.inputProps}
                  className={cn("mt-layout", props.inputProps?.className)}
               />
            </Form.Item>
         </Form>
      </Drawer>
   )
}

export default ScannerV3Drawer
export type { ScannerV3DrawerProps }
