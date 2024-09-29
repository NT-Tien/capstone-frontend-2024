"use client"

import ProList from "@ant-design/pro-list/lib"
import { Steps, Tag } from "antd"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import Card from "antd/es/card"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import IssueDetailsModal, { IssueDetailsModalProps } from "@/features/admin/components/IssueDetails.modal"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import { useRef } from "react"

type Props = {
   issues?: IssueDto[]
   isLoading?: boolean
}

function IssuesListSection({ issues, isLoading }: Props) {
   const control_issueDetails = useRef<RefType<IssueDetailsModalProps> | null>(null)

   return (
      <>
         <Card>
            <ProList
               className="list-no-padding"
               headerTitle={
                  <div className="mb-3 flex w-full items-center justify-between font-bold">
                     <span>Danh sách lỗi máy ({issues?.length ?? 0})</span>
                     {/*<Link href={`/admin/device/${api_request.data?.device.id}`}>*/}
                     {/*   <Button>Xem chi tiết</Button>*/}
                     {/*</Link>*/}
                  </div>
               }
               showExtra="always"
               dataSource={issues}
               loading={isLoading}
               // onItem={(entity) => control_issueDetails.current?.handleOpen({ issue: entity })}
               metas={{
                  title: {
                     dataIndex: ["typeError", "name"],
                     render: (_, entity) => (
                        <a onClick={() => control_issueDetails.current?.handleOpen({ issue: entity })}>
                           {entity.typeError.name}
                        </a>
                     ),
                  },
                  subtitle: {
                     dataIndex: "fixType",
                     render: (_, entity) => (
                        <Tag color={entity.fixType === "repair" ? "red" : "blue"}>
                           {entity.fixType === "repair" ? "Sửa chữa" : "Bảo dưỡng"}
                        </Tag>
                     ),
                  },
                  description: {
                     dataIndex: "description",
                  },
                  actions: {
                     render: (_, entity) => (
                        <Steps
                           type="inline"
                           current={(function () {
                              switch (entity.status) {
                                 case IssueStatusEnum.PENDING:
                                    return 0
                                 case IssueStatusEnum.RESOLVED:
                                    return 1
                                 case IssueStatusEnum.FAILED:
                                    return 2
                              }
                           })()}
                           items={[
                              {
                                 title: "Chưa xử lý",
                                 description: "Lỗi chưa được xử lý",
                              },
                              {
                                 title: "Thành công",
                                 description: "Xử lý lỗi thành công",
                              },
                              {
                                 title: "Thất bại",
                                 description: "Xử lý lỗi thất bại",
                              },
                           ]}
                        />
                     ),
                  },
               }}
            />
         </Card>
         <OverlayControllerWithRef ref={control_issueDetails}>
            <IssueDetailsModal />
         </OverlayControllerWithRef>
      </>
   )
}

export default IssuesListSection
