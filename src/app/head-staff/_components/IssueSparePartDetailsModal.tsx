import { ReactNode, useState } from "react"
import { App, Button, InputNumber, Modal } from "antd"
import { ProDescriptions } from "@ant-design/pro-components"
import { IssueSparePartDto } from "@/lib/domain/IssueSparePart/IssueSparePart.dto"
import dayjs from "dayjs"
import { DeleteOutlined, EditOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import HeadStaff_IssueSparePart_Delete from "@/features/head-maintenance/api/spare-part/delete.api"
import ModalConfirm from "@/old/ModalConfirm"
import HeadStaff_SparePart_Update from "@/features/head-maintenance/api/spare-part/update.api"
import useModalControls from "@/lib/hooks/useModalControls"

export default function IssueSparePartDetailsModal({
   children,
   refetch,
   showActions,
}: {
   children: (handleOpen: (sparePart: IssueSparePartDto) => void) => ReactNode
   refetch: () => void
   showActions: boolean
}) {
   const { message } = App.useApp()

   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (sparePart: IssueSparePartDto) => {
         setSparePart(sparePart)
         setSelectedQuantity(sparePart.quantity)
      },
      onClose: () => {
         setSparePart(undefined)
         setSelectedQuantity(0)
      },
   })
   const [sparePart, setSparePart] = useState<IssueSparePartDto | undefined>(undefined)
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
      mutationFn: HeadStaff_IssueSparePart_Delete,
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
               showActions && (
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
                     >
                        <Button className="w-full" danger={true} type="primary" icon={<DeleteOutlined />} size="large">
                           Xóa
                        </Button>
                     </ModalConfirm>
                  </div>
               )
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
                           render: (_, e) => dayjs(e.sparePart.expirationDate).add(7, "hours").format("YYYY-MM-DD"),
                        },
                     ]}
                  />
                  <section className="mb-layout mt-layout">
                     <header className="mb-2">
                        <h3 className="text-base font-medium">
                           Số lượng được chọn: {!showActions ? selectedQuantity : ""}
                        </h3>
                     </header>
                     {showActions && (
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
                     )}
                  </section>
               </>
            )}
         </Modal>
      </>
   )
}
