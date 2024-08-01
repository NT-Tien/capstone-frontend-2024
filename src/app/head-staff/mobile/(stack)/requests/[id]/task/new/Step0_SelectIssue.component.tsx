"use client"

import { UseQueryResult } from "@tanstack/react-query"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import React, { memo, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowRightOutlined, HomeOutlined, InfoCircleFilled, WarningFilled, WarningOutlined } from "@ant-design/icons"
import { App, Button, Card, Checkbox, Modal, Tag } from "antd"
import { FixType, FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import { CheckCard } from "@ant-design/pro-card"
import { usePageContext } from "@/app/head-staff/mobile/(stack)/requests/[id]/task/new/page.context"
import useModalControls from "@/common/hooks/useModalControls"

type Step0_Props = {
   api: UseQueryResult<FixRequestDto, Error>
   selectedIssues: {
      [key: string]: FixRequestIssueDto
   }
   setSelectedIssues: React.Dispatch<React.SetStateAction<{ [key: string]: FixRequestIssueDto }>>
}

const Step0_SelectIssue = function Component(props: Step0_Props) {
   const { open, handleOpen, handleClose } = useModalControls()
   const { setStep, setNextBtnProps, setPrevBtnProps } = usePageContext()
   const sizeSelectedIssues = useMemo(() => Object.values(props.selectedIssues).length, [props.selectedIssues])
   const router = useRouter()

   useEffect(() => {
      setPrevBtnProps({
         children: "Quay về",
         onClick: () => {
            props.api.isSuccess && router.push(`/head-staff/mobile/requests/${props.api.data.id}`)
         },
         icon: <HomeOutlined />,
      })
      setNextBtnProps({
         onClick: () => {
            if (Object.values(props.selectedIssues).find((issue) => issue.issueSpareParts.length === 0)) {
               handleOpen()
            } else {
               setStep(1)
            }
         },
         children: "Tiếp tục",
         icon: <ArrowRightOutlined />,
      })
   }, [
      handleOpen,
      props.api.data,
      props.api.isSuccess,
      props.selectedIssues,
      router,
      setNextBtnProps,
      setPrevBtnProps,
      setStep,
   ])

   useEffect(() => {
      if (sizeSelectedIssues === 0) {
         setNextBtnProps((prev) => ({
            ...prev,
            disabled: true,
         }))
      } else {
         setNextBtnProps((prev) => ({
            ...prev,
            disabled: false,
         }))
      }
   }, [setNextBtnProps, sizeSelectedIssues])

   return (
      <div className="mt-layout">
         <section className="mx-auto mb-layout w-max rounded-lg border-2 border-neutral-200 bg-white p-1 px-3 text-center">
            Chọn các lỗi cho tác vụ
            <InfoCircleFilled className="ml-2" />
         </section>
         <section className="mb-2 grid grid-cols-2 gap-2">
            <Button
               size="large"
               className="w-full bg-amber-500 text-white"
               onClick={() => {
                  props.setSelectedIssues(
                     props.api.data?.issues.reduce((acc, issue) => {
                        if (issue.fixType === FixType.REPAIR && issue.task === null) {
                           acc[issue.id] = issue
                        }
                        return acc
                     }, {} as any),
                  )
               }}
            >
               Chọn SỬA CHỮA
            </Button>
            <Button
               size="large"
               className="w-full bg-blue-700 text-white"
               onClick={() => {
                  props.setSelectedIssues(
                     props.api.data?.issues.reduce((acc, issue) => {
                        if (issue.fixType === FixType.REPLACE && issue.task === null) {
                           acc[issue.id] = issue
                        }
                        return acc
                     }, {} as any),
                  )
               }}
            >
               Chọn THAY THẾ
            </Button>
         </section>
         <Card size="small" className="mb-2">
            <div className="flex justify-between">
               <span>Đã chọn {sizeSelectedIssues} lỗi</span>
               {sizeSelectedIssues !== 0 && (
                  <span>
                     <Button type="link" size="small" onClick={() => props.setSelectedIssues({})}>
                        Xóa
                     </Button>
                  </span>
               )}
            </div>
         </Card>
         <div className="grid grid-cols-1 gap-2">
            {props.api.data?.issues
               .filter((issue) => issue.task === null)
               .map((issue) => (
                  <CheckCard
                     key={issue.id}
                     title={
                        <div className="flex items-center gap-2">
                           <Checkbox checked={props.selectedIssues[issue.id] !== undefined} />
                           <span>{issue.typeError.name}</span>
                        </div>
                     }
                     description={
                        <div className="mt-2 flex flex-col gap-1">
                           <div className="w-9/12 truncate">{issue.description}</div>
                           <div>
                              <Tag>{issue.typeError.duration} phút</Tag>
                              <Tag color={issue.issueSpareParts.length === 0 ? "red" : "default"}>
                                 {issue.issueSpareParts.length === 0 ? (
                                    <>
                                       <WarningOutlined className="mr-1" />
                                       Chưa có linh kiện
                                    </>
                                 ) : (
                                    `${issue.issueSpareParts.length} linh kiện`
                                 )}
                              </Tag>
                           </div>
                        </div>
                     }
                     extra={
                        <Tag
                           color={FixTypeTagMapper[String(issue.fixType)].colorInverse}
                           className="m-0 flex items-center gap-1"
                        >
                           {FixTypeTagMapper[String(issue.fixType)].icon}
                           {FixTypeTagMapper[String(issue.fixType)].text}
                        </Tag>
                     }
                     checked={props.selectedIssues[issue.id] !== undefined}
                     onChange={(checked) => {
                        props.setSelectedIssues((prev) => {
                           if (checked) {
                              return { ...prev, [issue.id]: issue }
                           } else {
                              const { [issue.id]: _, ...rest } = prev
                              return rest
                           }
                        })
                     }}
                     className="m-0 w-full"
                  ></CheckCard>
               ))}
         </div>
         <Modal
            open={open}
            onCancel={handleClose}
            title={
               <div className="text-yellow-500">
                  <WarningFilled className="mr-2" />
                  Lưu ý
               </div>
            }
            centered={true}
            okButtonProps={{
               className: "bg-yellow-500",
            }}
            okText={"Tiếp tục"}
            cancelText={"Hủy"}
            onOk={() => {
               setStep(1)
            }}
         >
            Một số lỗi bạn chọn không có linh kiện, bạn có chắc chắn muốn tiếp tục?
         </Modal>
      </div>
   )
}

export default Step0_SelectIssue
