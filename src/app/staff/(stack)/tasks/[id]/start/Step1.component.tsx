import IssueDetailsDrawer from "@/features/staff/components/overlays/IssueDetails.drawer"
import { TaskDto } from "@/lib/domain/Task/Task.dto"
import { FixTypeTagMapper } from "@/lib/domain/Issue/FixType.enum"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/lib/domain/Issue/IssueStatus.enum"
import { cn } from "@/lib/utils/cn.util"
import DataListView from "@/components/DataListView"
import { HomeOutlined, RightOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import { MapPin } from "@phosphor-icons/react"
import { Badge, Button, Card, List, Spin, Tabs, Tag, Typography } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useMemo, useRef, useState } from "react"
import { GeneralProps } from "./page"
import OverlayControllerWithRef, { RefType } from "@/components/utils/OverlayControllerWithRef"
import ReturnSparePartDrawer, {
   ReturnSparePartDrawerProps,
} from "@/features/staff/components/overlays/ReturnSparePart.drawer"
import FinishTaskDrawer, { FinishTaskDrawerProps } from "@/features/staff/components/overlays/FinishTask.drawer"

type Step2Props = GeneralProps & {
   data?: TaskDto
   refetch: () => void
   loading: boolean
   id: string
}

export default function Step1(props: Step2Props) {
   const router = useRouter()
   const [tab, setTab] = useState<"task" | "issues">("issues")

   const control_returnSparePartDrawer = useRef<RefType<ReturnSparePartDrawerProps>>(null)
   const control_finishTaskDrawer = useRef<RefType<FinishTaskDrawerProps>>(null)

   const failedIssuesWithSpareParts = useMemo(() => {
      const failedIssues = props.data?.issues.filter((issue) => issue.status === IssueStatusEnum.FAILED)
      return failedIssues?.filter((failedIssue) => failedIssue.issueSpareParts.length > 0) ?? []
      // return failedIssues?.filter((failedIssue) => failedIssue.issueSpareParts.length > 0)
   }, [props.data?.issues])

   if (!props.data) {
      return <Spin fullscreen />
   }

   return (
      <>
         <Tabs
            className="std-layout-outer main-tabs"
            activeKey={tab}
            onChange={(key) => setTab(key as "task" | "issues")}
            items={[
               {
                  key: "task",
                  label: "Chi tiết tác vụ",
                  children: (
                     <div>
                        <ProDescriptions
                           column={1}
                           loading={props.loading}
                           title={props.data.name}
                           dataSource={props.data}
                           size="small"
                           extra={
                              <Tag color={props.data?.priority === true ? "red" : "default"}>
                                 {props.data?.priority === true
                                    ? "Ưu tiên"
                                    : props.data?.priority === false
                                      ? "Thường"
                                      : "-"}
                              </Tag>
                           }
                           columns={[
                              {
                                 label: "Ngày sửa",
                                 render: (_, e) => dayjs(e.fixerDate).add(7, "hours").format("DD/MM/YYYY"),
                              },
                              {
                                 key: "3",
                                 label: "Tổng thời lượng",
                                 render: (_, e) => `${e.totalTime} phút`,
                              },
                              {
                                 key: "2",
                                 label: "Thông số kỹ thuật",
                                 dataIndex: "operator",
                              },
                              {
                                 key: "3",
                                 label: "Hoàn thành",
                                 render: (_, e) =>
                                    Math.floor(
                                       (e.issues.reduce(
                                          (acc, prev) => acc + (prev.status === IssueStatusEnum.RESOLVED ? 1 : 0),
                                          0,
                                       ) /
                                          e.issues.length) *
                                          100,
                                    ) + "%",
                              },
                           ]}
                        />
                        <section className="std-layout-outer mt-6 bg-white py-layout">
                           <h2 className="mb-2 px-layout text-lg font-semibold">Chi tiết thiết bị</h2>
                           <DataListView
                              dataSource={props.data?.device}
                              bordered
                              itemClassName="py-2"
                              labelClassName="font-normal text-neutral-500"
                              className="rounded-lg"
                              items={[
                                 {
                                    label: "Mẫu máy",
                                    value: (s) => s.machineModel?.name,
                                 },
                                 {
                                    label: "Khu vực",
                                    value: (s) => s.area?.name,
                                 },
                                 {
                                    label: "Vị trí (x, y)",
                                    value: (s) => (
                                       <a className="flex items-center gap-1">
                                          {s.positionX ?? props.data?.device_renew?.positionX} x{" "}
                                          {s.positionY ?? props.data?.device_renew?.positionY}
                                          <MapPin size={16} weight="fill" />
                                       </a>
                                    ),
                                 },
                                 {
                                    label: "Nhà sản xuất",
                                    value: (s) => s.machineModel?.manufacturer,
                                 },
                                 {
                                    label: "Năm sản xuất",
                                    value: (s) => s.machineModel?.yearOfProduction,
                                 },
                                 {
                                    label: "Thời hạn bảo hành",
                                    value: (s) => s.machineModel?.warrantyTerm,
                                 },
                                 {
                                    label: "Mô tả",
                                    value: (s) => s.description,
                                 },
                              ]}
                           />
                        </section>
                     </div>
                  ),
               },
               {
                  key: "issues",
                  label: "Lỗi cần sửa",
                  children: (
                     <div className="pt-1">
                        <IssueDetailsDrawer
                           afterSuccess={() => {
                              props.refetch()
                           }}
                           scanCompleted={true}
                        >
                           {(handleOpen) => (
                              <List
                                 dataSource={props.data?.issues.sort((a, b) =>
                                    a.status === b.status ? 0 : a.status === IssueStatusEnum.PENDING ? -1 : 1,
                                 )}
                                 split={false}
                                 renderItem={(item) => (
                                    <Badge.Ribbon
                                       text={IssueStatusEnumTagMapper[item.status].text}
                                       color={IssueStatusEnumTagMapper[item.status].color}
                                    >
                                       <Card
                                          size="small"
                                          className={cn(
                                             "mb-2",
                                             item.status === IssueStatusEnum.RESOLVED && "bg-green-100 opacity-40",
                                             item.status === IssueStatusEnum.FAILED && "bg-red-100 opacity-40",
                                          )}
                                          hoverable
                                          onClick={() => props.data && handleOpen(item, props.data)}
                                       >
                                          <div className="flex flex-col">
                                             <div>
                                                <Typography.Title level={5} className="m-0 font-semibold">
                                                   {item.typeError.name}
                                                </Typography.Title>
                                             </div>
                                             <div className="mt-2 flex items-center">
                                                <Tag color={FixTypeTagMapper[item.fixType].colorInverse}>
                                                   {FixTypeTagMapper[item.fixType].text}
                                                </Tag>
                                                <span className="w-[75%] flex-grow truncate">{item.description}</span>
                                                <Button
                                                   icon={<RightOutlined />}
                                                   type={"text"}
                                                   size="small"
                                                   className="self-end justify-self-end"
                                                />
                                             </div>
                                          </div>
                                       </Card>
                                    </Badge.Ribbon>
                                 )}
                              />
                           )}
                        </IssueDetailsDrawer>
                     </div>
                  ),
               },
            ]}
         />
         <div className="fixed bottom-0 left-0 flex w-full gap-3 bg-white p-layout">
            <Button
               icon={<HomeOutlined />}
               size="large"
               onClick={() => router.push("/staff/tasks")}
               className="aspect-square"
            ></Button>
            {failedIssuesWithSpareParts.length > 0 && !props.data.return_spare_part_data ? (
               <Button
                  size="large"
                  type="primary"
                  className="w-full"
                  onClick={() => {
                     const issueSpareParts = failedIssuesWithSpareParts.flatMap((issue) => issue.issueSpareParts)
                     control_returnSparePartDrawer.current?.handleOpen({
                        task: props.data,
                        returnSpareParts: issueSpareParts,
                     })
                  }}
               >
                  Tiếp tục: Trả linh kiện
               </Button>
            ) : (
               <Button
                  size="large"
                  type="primary"
                  className="w-full"
                  disabled={!props.data?.issues.every((issue) => issue.status !== IssueStatusEnum.PENDING)}
                  // onClick={props.handleNext}
                  onClick={() =>
                     control_finishTaskDrawer.current?.handleOpen({
                        task: props.data,
                     })
                  }
               >
                  Hoàn thành
               </Button>
            )}
         </div>
         <OverlayControllerWithRef ref={control_returnSparePartDrawer}>
            <ReturnSparePartDrawer
               onFinish={async () => {
                  props.refetch()
                  control_returnSparePartDrawer.current?.handleClose()
               }}
            />
         </OverlayControllerWithRef>
         <OverlayControllerWithRef ref={control_finishTaskDrawer}>
            <FinishTaskDrawer />
         </OverlayControllerWithRef>
      </>
   )
}
