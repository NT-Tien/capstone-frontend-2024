import { ReactNode, useState } from "react"
import useModalControls from "@/common/hooks/useModalControls"
import { Button, Divider, InputNumber, Modal } from "antd"
import { SparePartDto } from "@/common/dto/SparePart.dto"
import dayjs from "dayjs"
import { ProDescriptions } from "@ant-design/pro-components"
import { CloseOutlined, DeleteOutlined, MinusOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons"

export default function BasicSelectSparePartModal({
   children,
   ...props
}: {
   children: (handleOpen: (sparePart: SparePartDto, defaultQuantity?: number, isUpdate?: boolean) => void) => ReactNode
   onOk: (sparePart: SparePartDto, quantity: number) => void
   afterClose?: () => void
}) {
   const [sparePart, setSparePart] = useState<SparePartDto | undefined>()
   const [selectedQuantity, setSelectedQuantity] = useState<number>(1)
   const [isUpdate, setIsUpdate] = useState<boolean>(false)

   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (sparePart: SparePartDto, defaultQuantity?: number, isUpdate?: boolean) => {
         setSparePart(sparePart)
         setSelectedQuantity(defaultQuantity ?? 1)
         setIsUpdate(isUpdate ?? false)
      },
      onClose: () => {
         setSparePart(undefined)
         setSelectedQuantity(1)
         props.afterClose?.()
         setIsUpdate(false)
      },
   })

   return (
      <>
         {children(handleOpen)}
         <Modal
            open={open}
            onCancel={handleClose}
            title="Chọn linh kiện"
            centered
            footer={[
               <div key="actions" className="mt-6 flex w-full gap-4">
                  <Button key="cancel" onClick={handleClose} className="w-full" size="large" icon={<CloseOutlined />}>
                     Hủy
                  </Button>
                  {((!isUpdate && selectedQuantity > 0) || isUpdate) && (
                     <Button
                        key="submit"
                        size="large"
                        icon={selectedQuantity <= 0 ? <DeleteOutlined /> : <SaveOutlined />}
                        danger={selectedQuantity <= 0}
                        type="primary"
                        className="w-full"
                        onClick={() => {
                           if (sparePart) {
                              props.onOk(sparePart, selectedQuantity)
                              handleClose()
                           }
                        }}
                     >
                        {selectedQuantity <= 0 ? "Xóa linh kiện" : "Lưu"}
                     </Button>
                  )}
               </div>,
            ]}
         >
            <ProDescriptions
               dataSource={sparePart}
               className="mt-3"
               size="small"
               columns={[
                  {
                     key: "name",
                     title: "Tên",
                     dataIndex: ["name"],
                  },
                  {
                     key: "Quantity",
                     title: "Số lượng trong kho",
                     dataIndex: ["quantity"],
                  },
                  {
                     key: "exp",
                     title: "Ngày hết hạn",
                     dataIndex: ["expirationDate"],
                     render: (_, e) => dayjs(e.expirationDate).add(7, "hours").format("YYYY-MM-DD"),
                  },
               ]}
            />
            {sparePart && (
               <>
                  <Divider className="my-4" />
                  <main className="grid w-full place-content-center">
                     <h3 className="mb-2 text-center font-medium text-neutral-500">Chọn số lượng</h3>
                     <div className="flex w-full items-center gap-2">
                        <Button
                           icon={<MinusOutlined />}
                           onClick={() => {
                              setSelectedQuantity((prev) => {
                                 if (prev - 1 <= 0) return 0
                                 return prev - 1
                              })
                           }}
                           size="large"
                        />
                        <InputNumber
                           value={selectedQuantity}
                           onChange={(e) => {
                              let num = e
                              if (num === null) num = 1
                              else if (num > sparePart.quantity) num = sparePart.quantity

                              setSelectedQuantity(num)
                           }}
                           size="large"
                           inputMode="numeric"
                        />
                        <Button
                           icon={<PlusOutlined />}
                           onClick={() => {
                              setSelectedQuantity((prev) => {
                                 if (prev + 1 > sparePart.quantity) return sparePart.quantity
                                 return prev + 1
                              })
                           }}
                           size="large"
                        />
                     </div>
                  </main>
               </>
            )}
         </Modal>
      </>
   )
}
