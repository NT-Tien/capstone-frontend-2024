import { ReactNode, useState } from "react"
import { App, Button, InputNumber, Modal } from "antd"
import { ProDescriptions } from "@ant-design/pro-components"
import { FixRequestIssueSparePartDto } from "@/common/dto/FixRequestIssueSparePart.dto"
import dayjs from "dayjs"
import { DeleteOutlined, EditOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import HeadStaff_SparePart_Delete from "@/app/head-staff/_api/spare-part/delete.api"
import ModalConfirm from "@/common/components/ModalConfirm"
import HeadStaff_SparePart_Update from "@/app/head-staff/_api/spare-part/update.api"
import useModalControls from "@/common/hooks/useModalControls"

export default function IssueSparePartDetailsModal({
   children,
   refetch,
}: {
   children: (handleOpen: (sparePart: FixRequestIssueSparePartDto) => void) => ReactNode
   refetch: () => void
}) {
   const { message } = App.useApp()

   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (sparePart: FixRequestIssueSparePartDto) => {
         setSparePart(sparePart)
         setSelectedQuantity(sparePart.quantity)
      },
      onClose: () => {
         setSparePart(undefined)
         setSelectedQuantity
      },
   })
   const [sparePart, setSparePart] = useState<FixRequestIssueSparePartDto | undefined>(undefined)
   const [selectedQuantity, setSelectedQuantity] = useState<number>(0)

   const mutate_updateSparePart = useMutation({
      mutationFn: HeadStaff_SparePart_Update,
      onMutate: async () => {
         message.destroy("update-spare-part")
         message.open({
            type: "loading",
            key: "update-spare-part",
            content: "Updating Spare Part...",
         })
      },
      onError: async () => {
         message.error("Failed to update spare part")
      },
      onSuccess: async () => {
         message.success("Spare part updated")
      },
      onSettled: () => {
         message.destroy("update-spare-part")
      },
   })

   const mutate_deleteSparePart = useMutation({
      mutationFn: HeadStaff_SparePart_Delete,
      onMutate: async () => {
         message.destroy("remove-spare-part")
         message.open({
            type: "loading",
            key: "remove-spare-part",
            content: "Removing Spare Part...",
         })
      },
      onError: async () => {
         message.error("Failed to remove spare part")
      },
      onSuccess: async () => {
         message.success("Spare part removed")
      },
      onSettled: () => {
         message.destroy("remove-spare-part")
      },
   })

   function handleUpdateQuantity_IssueSparePart() {
      if (!sparePart) return
      mutate_updateSparePart.mutate(
         {
            id: sparePart.id,
            payload: {
               quantity: selectedQuantity,
            },
         },
         {
            onSuccess: async () => {
               handleClose()
               refetch()
            },
         },
      )
   }

   function handleDeleteIssueSparePart() {
      if (!sparePart) return
      mutate_deleteSparePart.mutate(
         {
            id: sparePart.id,
         },
         {
            onSuccess: async () => {
               handleClose()
               refetch()
            },
         },
      )
   }

   return (
      <>
         {children(handleOpen)}{" "}
         <Modal
            open={open}
            onCancel={handleClose}
            title="Thông tin linh kiện"
            footer={
               <div className="flex w-full justify-between gap-3">
                  <Button
                     className="w-full"
                     type="primary"
                     icon={<EditOutlined />}
                     size="large"
                     disabled={sparePart?.quantity === selectedQuantity}
                     onClick={handleUpdateQuantity_IssueSparePart}
                  >
                     Cập nhật
                  </Button>
                  <ModalConfirm
                     confirmText="Delete"
                     confirmProps={{ danger: true }}
                     onConfirm={handleDeleteIssueSparePart}
                     closeAfterConfirm
                  >
                     <Button className="w-full" danger={true} type="primary" icon={<DeleteOutlined />} size="large">
                        Xóa
                     </Button>
                  </ModalConfirm>
               </div>
            }
         >
            {!!sparePart && (
               <>
                  <ProDescriptions
                     dataSource={sparePart}
                     className="mt-3"
                     size="small"
                     columns={[
                        {
                           key: "name",
                           title: "Tên",
                           dataIndex: ["sparePart", "name"],
                        },
                        {
                           key: "Quantity",
                           title: "Số lượng trong kho",
                           dataIndex: ["sparePart", "quantity"],
                        },
                        {
                           key: "exp",
                           title: "Ngày hết hạn",
                           dataIndex: ["sparePart", "expirationDate"],
                           render: (_, e) => dayjs(e.sparePart.expirationDate).format("YYYY-MM-DD"),
                        },
                     ]}
                  />
                  <section className="mb-layout mt-layout">
                     <header className="mb-2">
                        <h3 className="text-base font-medium">Số lượng được chọn</h3>
                     </header>
                     <main className="flex gap-2">
                        <Button
                           icon={<MinusOutlined />}
                           onClick={() => {
                              setSelectedQuantity((prev) => {
                                 if (prev - 1 < 1) return 1
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
                              else if (num < 1) num = 1
                              else if (num > sparePart?.sparePart.quantity) num = sparePart?.sparePart.quantity

                              setSelectedQuantity(num)
                           }}
                           size="large"
                        />
                        <Button
                           icon={<PlusOutlined />}
                           onClick={() => {
                              setSelectedQuantity((prev) => {
                                 if (prev + 1 > sparePart?.sparePart.quantity) return sparePart?.sparePart.quantity
                                 return prev + 1
                              })
                           }}
                           size="large"
                        />
                     </main>
                  </section>
               </>
            )}
         </Modal>
      </>
   )
}
