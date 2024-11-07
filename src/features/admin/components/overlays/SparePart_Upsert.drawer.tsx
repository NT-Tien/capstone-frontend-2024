import { DatePicker, Divider, Drawer, DrawerProps, message, Select, Typography, Upload } from "antd"
import { useEffect, useMemo, useState } from "react"
import Button from "antd/es/button"
import Form from "antd/es/form"
import { SparePartDto } from "@/lib/domain/SparePart/SparePart.dto"
import Input from "antd/es/input"
import dayjs from "dayjs"
import admin_mutations from "../../mutations"
import admin_queries from "../../queries"
import { RcFile, UploadFile } from "antd/es/upload"
import { File_Image_Upload } from "@/features/common/api/file/upload_image.api"
import checkImageUrl from "@/lib/utils/checkImageUrl.util"

type FormFieldTypes = {
   name: string
   quantity: number
   expirationDate: string
   machineModel: string
   image: UploadFile | undefined
}
type SparePart_UpsertDrawerProps = {
   sparePart?: SparePartDto
   machineModel?: string
   onSuccess?: () => void
}
type Props = Omit<DrawerProps, "children"> & SparePart_UpsertDrawerProps

function SparePart_UpsertDrawer(props: Props) {
   const [form] = Form.useForm<FormFieldTypes>()
   const mutate_createSparePart = admin_mutations.sparePart.create()
   const mutate_updateSparePart = admin_mutations.sparePart.update()
   const api_machineModel = admin_queries.machine_model.all({ withDevices: false })
   const [loadingImage, setLoadingImage] = useState(false)

   const isUpdating = useMemo(() => !!props.sparePart, [props.sparePart])

   const imageFile: UploadFile | undefined = props.sparePart?.image?.[0]
      ? {
           uid: "1",
           name: "Image 1",
           url: props.sparePart.image[0],
           status: "done",
           size: 0,
           type: "image/png",
        }
      : undefined

   useEffect(() => {
      if (props.sparePart) {
         form.setFieldsValue({
            name: props.sparePart?.name,
            quantity: props.sparePart?.quantity,
            expirationDate: dayjs(props?.sparePart?.expirationDate).format("DD/MM/YYYY HH:mm"),
            machineModel: props?.sparePart?.machineModel?.id,
            image: imageFile,
         })
      }
   }, [props.sparePart, imageFile])

   const machineModels = useMemo(() => {
      if (!api_machineModel.isSuccess) return []
      return api_machineModel.data.map((item) => ({
         label: item.name,
         value: item.id,
      }))
   }, [api_machineModel.data, api_machineModel.isSuccess])

   function handleSubmit(formProps: FormFieldTypes) {
      if (isUpdating) {
         mutate_updateSparePart.mutate(
            {
               id: props.sparePart!.id,
               payload: {
                  ...formProps,
                  machineModel: formProps.machineModel ?? "",
               },
            },
            {
               onSuccess: () => {
                  props.onSuccess?.()
               },
            },
         )
      } else {
         mutate_createSparePart.mutate(
            {
               ...formProps,
            },
            {
               onSuccess: () => {
                  props.onSuccess?.()
                  form.resetFields()
               },
            },
         )
      }
   }

   return (
      <Drawer
         title={isUpdating ? "Cập nhật linh kiện" : "Thêm linh kiện mới"}
         placement="right"
         footer={
            <div className="flex items-center gap-3">
               <Button onClick={() => form.resetFields()}>Hủy</Button>
               <Button block type={"primary"} onClick={() => form.submit()}>
                  {isUpdating ? "Cập nhật" : "Thêm mới"}
               </Button>
            </div>
         }
         {...props}
      >
         <Form<FormFieldTypes>
            form={form}
            onFinish={handleSubmit}
            initialValues={{
               name: props.sparePart?.name,
               quantity: props.sparePart?.quantity,
               expirationDate: dayjs(props.sparePart?.expirationDate).format("DD/MM/YYYY HH:mm"),
            }}
         >
            {isUpdating ? (
               <Form.Item<FormFieldTypes> name="name" label="Tên linh kiện" rules={[{ required: true }]}>
                  <Input placeholder="Nhập tên linh kiện" />
               </Form.Item>
            ) : (
               <Form.Item name="name" label="Tên linh kiện" rules={[{ required: true }]}>
                  {" "}
                  <Input placeholder="Nhập tên linh kiện" />
               </Form.Item>
            )}
            <Form.Item<FormFieldTypes>
               name="quantity"
               label="Số lượng trong kho"
               rules={[
                  { required: true },
                  {
                     transform: (value) => Number(value),
                     validator: (rule, value, callback) => {
                        if (isNaN(value)) {
                           callback()
                        } else if (value < 0) {
                           callback("Số lượng không thể nhỏ hơn 0")
                        } else {
                           callback()
                        }
                     },
                  },
               ]}
            >
               <Input type="number" placeholder="Nhập số lượng" />
            </Form.Item>
            <Form.Item<FormFieldTypes> name="expirationDate" label="Ngày hết hạn" rules={[{ required: true }]}>
               <DatePicker placeholder="Chọn ngày hết hạn" format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item<FormFieldTypes> name="machineModel" label="Mẫu máy" rules={[{ required: true }]}>
               <Select
                  placeholder="Chọn mẫu máy"
                  dropdownRender={(menu) => (
                     <>
                        {menu}
                        <Divider style={{ margin: "8px 0" }} />
                     </>
                  )}
                  filterOption={(input, option) =>
                     (option?.label ?? "").toString().toLocaleLowerCase().includes(input.toLocaleLowerCase())
                  }
                  options={machineModels}
               ></Select>
            </Form.Item>
            <Form.Item<FormFieldTypes> name="image" label="Hình ảnh">
               <Upload.Dragger
                  accept=".jpg,.jpeg,.png,.bmp,.svg,.webp,.gif"
                  customRequest={async (props) => {
                     const file = props.file as RcFile
                     const response = await File_Image_Upload({ file })
                     if (response.status === 201) props.onSuccess?.(response.data.path)
                     else props.onError?.(new Error("Failed to upload file."), response)
                  }}
                  showUploadList={true}
                  listType="picture"
                  multiple={false}
                  maxCount={1}
                  method="POST"
                  isImageUrl={checkImageUrl}
                  onChange={(info) => {
                     setLoadingImage(false)
                     if (info.file.status === "done") {
                        form.setFieldsValue({ image: info.file })
                     }
                     if (info.file.status === "uploading") {
                        setLoadingImage(true)
                     }
                     if (info.file.status === "error") {
                        message.error("Tải tệp thất bại")
                     }
                     if (info.file.status === "removed") {
                        form.setFieldsValue({ image: {} })
                        message.success("Tẹp đã bị xóa")
                     }
                  }}
               >
                  {" "}
                  <div className="flex flex-col items-center justify-center">
                     <Typography.Title level={5}>Nhấp vào đây</Typography.Title>
                     <p>Vui lòng tải hình ảnh lên.</p>
                  </div>
               </Upload.Dragger>
            </Form.Item>
         </Form>
      </Drawer>
   )
}

export default SparePart_UpsertDrawer
export type { SparePart_UpsertDrawerProps }
