import { App, Button, Card, Drawer, DrawerProps, Dropdown, Form, Input, InputProps, Result } from "antd"
import AlertCard from "@/components/AlertCard"
import { Scanner } from "@yudiel/react-qr-scanner"
import { CloseCircleFilled, IdcardOutlined, MoreOutlined, PhoneOutlined, ReloadOutlined, SendOutlined } from "@ant-design/icons"
import { cn } from "@/lib/utils/cn.util"
import { isUUID } from "@/lib/utils/isUUID.util"
import uuidNormalizer from "@/lib/utils/uuid-normalizer.util"
import { useEffect, useState } from "react"

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
   const [error, setError] = useState<string | null>(null)

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

   function handleError(e: unknown) {
      console.log(e instanceof DOMException)
      if (e instanceof DOMException) {
         switch (e.name) {
            case "NotAllowedError": {
               setError("Ứng dụng không được cấp quyền truy cập camera")
               break
            }
            case "NotFoundError": {
               setError("Không tìm thấy camera")
               break
            }
            default: {
               setError("Có lỗi đã xảy ra khi kết nối camera. Vui lòng thử lại")
               break
            }
         }
      }
   }

   useEffect(() => {
      if (!props.open) {
         setError(null)
      }
   }, [props.open])

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
            {error ? (
               <Card className="h-full w-full" classNames={{ body: "grid place-items-center h-full" }}>
                  <Result
                     className="p-0"
                     title={<h1 className='text-xl font-bold'>Đã xảy ra lỗi</h1>}
                     icon={<CloseCircleFilled className='text-red-500 text-[60px]' />}
                     status={"error"}
                     subTitle={<p className='text-base'>{error}</p>}
                     extra={
                        <Button
                           type={"primary"}
                           onClick={async () => {
                              setError(null)
                           }}
                           icon={<ReloadOutlined />}
                        >
                           Thử lại
                        </Button>
                     }
                  />
               </Card>
            ) : (
               <Scanner
                  onScan={async (e) => e[0]?.rawValue && handleFinishScan(e[0].rawValue)}
                  allowMultiple={true}
                  scanDelay={1000}
                  onError={handleError}
                  components={{ torch: true }}
               />
            )}
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
