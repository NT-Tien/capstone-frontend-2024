import IssueDetailsDrawer from "@/app/staff/_components/IssueDetails.drawer"
import ScannerDrawer from "@/common/components/Scanner.drawer"
import { TaskDto } from "@/common/dto/Task.dto"
import { FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/common/enum/issue-status.enum"
import { cn } from "@/common/util/cn.util"
import DataListView from "@/components/DataListView"
import { HomeOutlined, RightOutlined } from "@ant-design/icons"
import { ProDescriptions } from "@ant-design/pro-components"
import { MapPin } from "@phosphor-icons/react"
import { App, Badge, Button, Card, List, Spin, Tabs, Tag, Typography } from "antd"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { GeneralProps } from "./page"
import { ReceiveWarrantyTypeErrorId } from "@/constants/Warranty"

type Step2Props = GeneralProps & {
   data?: TaskDto
   refetch: () => void
   loading: boolean
   id: string
}

export default function Step1(props: Step2Props) {
   const [hasScanned, setHasScanned] = useState(false)
   const [tab, setTab] = useState<"task" | "issues">("task")

   const { message } = App.useApp()
   const router = useRouter()

   function onScan(id: string) {
      if (props.data?.device.id !== id) {
         message.error("Mã QR không hợp lệ")
         return
      }

      message.success("Quét mã QR thành công")
      setHasScanned(true)
      setTab("issues")
      const scannedCache = localStorage.getItem("staff-task")
      if (!scannedCache) {
         localStorage.setItem("staff-task", JSON.stringify([id]))
      } else {
         const cache = JSON.parse(scannedCache) as { [taskId: string]: string }
         cache[props.id] = id
         localStorage.setItem("staff-task", JSON.stringify(cache))
      }
   }

   useEffect(() => {
      if (props.data?.issues.find((i) => i.typeError.id === ReceiveWarrantyTypeErrorId)) {
         setHasScanned(true)
         setTab("issues")
         return
      }

      if (props.data?.issues.every((issue) => issue.status !== IssueStatusEnum.PENDING)) {
         setHasScanned(true)
         return
      }

      const scannedCache = localStorage.getItem("staff-task")
      if (!scannedCache) {
         return
      }

      const cache = JSON.parse(scannedCache) as { [taskId: string]: string }
      if (cache[props.id]) {
         setHasScanned(true)
      }
   }, [props.data, props.id])

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
                                          {s.positionX} x {s.positionY}
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
                  label: "Vấn đề",
                  children: (
                     <div className="pt-1">
                        <IssueDetailsDrawer
                           afterSuccess={() => {
                              props.refetch()
                           }}
                           scanCompleted={hasScanned}
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
                                       color={IssueStatusEnumTagMapper[item.status].colorInverse}
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
         <ScannerDrawer onScan={onScan}>
            {(handleOpen) => (
               <div className="fixed bottom-0 left-0 flex w-full gap-3 bg-white p-layout">
                  <Button
                     icon={<HomeOutlined />}
                     size="large"
                     className="aspect-square w-16"
                     onClick={() => {
                        router.push("/staff/dashboard")
                     }}
                  />
                  {hasScanned ? (
                     <Button
                        size="large"
                        type="primary"
                        className="w-full"
                        disabled={!props.data?.issues.every((issue) => issue.status !== IssueStatusEnum.PENDING)}
                        onClick={props.handleNext}
                     >
                        Tiếp tục
                     </Button>
                  ) : (
                     <Button size="large" type="primary" className="w-full" onClick={handleOpen}>
                        Quét mã QR để tiếp tục
                     </Button>
                  )}
               </div>
            )}
         </ScannerDrawer>
      </>
   )
}
