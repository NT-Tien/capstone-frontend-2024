import { ReactNode, useState } from "react"
import useModalControls from "@/common/hooks/useModalControls"
import { App, Button, Card, Col, Drawer, Form, Input, Rate, Row } from "antd"
import { InfoCircleFilled } from "@ant-design/icons"
import { CheckCard, ProFormTextArea } from "@ant-design/pro-components"
import { useMutation } from "@tanstack/react-query"
import Head_Request_UpdateClose from "@/app/head/_api/request/update-close.api"
import { UserOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import { FixRequestStatuses } from "@/common/dto/status/FixRequest.status"

type Props = {
   onSuccess?: () => void
}

export default function FeedbackDrawer({
   children,
   ...props
}: {
   children: (handleOpen: (requestId: string) => void) => ReactNode
} & Props) {
   const { message } = App.useApp()
   const { open, handleOpen, handleClose } = useModalControls({
      onOpen: (requestId: string) => {
         setRequestId(requestId)
      },
      onClose: () => {
         setRequestId(undefined)
      },
   })
   const router = useRouter()

   const mutate_UpdateCloseRequest = useMutation({
      mutationFn: Head_Request_UpdateClose,
      onMutate: async () => {
         message.destroy("loading")
         message.loading({
            content: "Đang xử lý...",
            key: "loading",
         })
      },
      onSettled: () => {
         message.destroy("loading")
      },
      onSuccess: async () => {
         message.success("Đóng thành công")
      },
      onError: async () => {
         message.error("Đóng thất bại")
      },
   })

   const [requestId, setRequestId] = useState<string | undefined>()
   const [content, setContent] = useState("")

   function handleClick() {
      if (!requestId) return

      mutate_UpdateCloseRequest.mutate(
         {
            id: requestId,
            payload: {
               content,
            },
         },
         {
            onSuccess: () => {
               router.push(`/head/history?status=${"closed" satisfies FixRequestStatuses}`)
            },
         },
      )
   }

   return (
      <>
         {children(handleOpen)}
         <Drawer open={open} onClose={handleClose} title="Xác nhận và Đánh giá" placement="bottom" height="max-content">
            <Card size="small" className="mb-layout">
               <InfoCircleFilled className="mr-1" />
               Vui lòng đánh giá quá trình sửa chữa
            </Card>
            <section className="mb-3 flex justify-center">
               <Col>
                  <Row className="flex text-3xl font-medium">
                     <UserOutlined />
                     <Row className="m-1 font-medium">Đánh giá nhân viên</Row>
                  </Row>
                  <Row gutter={[16, 16]} justify="center">
                     <Col>
                        <CheckCard
                           style={{
                              width: "10rem",
                              height: "2.5rem",
                              overflow: "hidden",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textAlign: "center",
                           }}
                        >
                           Thân thiện, lịch sự
                        </CheckCard>
                     </Col>
                     <Col>
                        <CheckCard
                           style={{
                              width: "10rem",
                              height: "2.5rem",
                              overflow: "hidden",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textAlign: "center",
                           }}
                        >
                           Hỗ trợ nhiệt tình
                        </CheckCard>
                     </Col>
                  </Row>
               </Col>
            </section>
            <ProFormTextArea
               label="Đánh giá"
               fieldProps={{
                  placeholder: "Nhập đánh giá của bạn",
                  maxLength: 300,
                  showCount: true,
                  onChange: (e) => setContent(e.target.value),
                  value: content,
               }}
            />
            <Button className="mt-2 w-full" size="large" type="primary" onClick={handleClick}>
               Gửi
            </Button>
         </Drawer>
      </>
   )
}
