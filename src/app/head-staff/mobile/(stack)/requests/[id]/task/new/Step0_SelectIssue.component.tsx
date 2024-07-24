"use client"

import { UseQueryResult } from "@tanstack/react-query"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import React, { memo, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowRightOutlined, HomeOutlined, InfoCircleFilled } from "@ant-design/icons"
import { Button, Card, Checkbox, Tag } from "antd"
import { FixType, FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import { CheckCard } from "@ant-design/pro-card"
import { usePageContext } from "@/app/head-staff/mobile/(stack)/requests/[id]/task/new/page"

type Step0_Props = {
   api: UseQueryResult<FixRequestDto, Error>
   selectedIssues: {
      [key: string]: FixRequestIssueDto
   }
   setSelectedIssues: React.Dispatch<React.SetStateAction<{ [key: string]: FixRequestIssueDto }>>
}

const Step0_SelectIssue = memo(function Component(props: Step0_Props) {
   const { setStep, setNextBtnProps, setPrevBtnProps } = usePageContext()
   const sizeSelectedIssues = useMemo(() => Object.values(props.selectedIssues).length, [props.selectedIssues])
   const router = useRouter()

   useEffect(() => {
      setPrevBtnProps({
         children: "Home",
         onClick: () => {
            router.push("/head-staff/mobile/requests")
         },
         icon: <HomeOutlined />,
      })
      setNextBtnProps({
         onClick: () => {
            setStep(1)
         },
         children: "Continue",
         icon: <ArrowRightOutlined />,
      })
   }, [router, setNextBtnProps, setPrevBtnProps, setStep])

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
            Select Issues for the Task
            <InfoCircleFilled className="ml-2" />
         </section>
         <section className="mb-2 grid grid-cols-2 gap-2">
            <Button
               size="large"
               className="w-full bg-amber-500 text-white"
               onClick={() => {
                  props.setSelectedIssues(
                     props.api.data?.issues.reduce((acc, issue) => {
                        if (issue.fixType === FixType.REPAIR) {
                           acc[issue.id] = issue
                        }
                        return acc
                     }, {} as any),
                  )
               }}
            >
               Select all REPAIR
            </Button>
            <Button
               size="large"
               className="w-full bg-blue-700 text-white"
               onClick={() => {
                  props.setSelectedIssues(
                     props.api.data?.issues.reduce((acc, issue) => {
                        if (issue.fixType === FixType.REPLACE) {
                           acc[issue.id] = issue
                        }
                        return acc
                     }, {} as any),
                  )
               }}
            >
               Select all REPLACE
            </Button>
         </section>
         <Card size="small" className="mb-2">
            <div className="flex justify-between">
               <span>Selected {sizeSelectedIssues} issue(s)</span>
               {sizeSelectedIssues !== 0 && (
                  <span>
                     <Button type="link" size="small" onClick={() => props.setSelectedIssues({})}>
                        Clear
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
                        <div className="mt-2 flex justify-between">
                           <div className="w-9/12 truncate">{issue.description}</div>
                           <div className="text-neutral-600">{issue.typeError.duration} minute(s)</div>
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
      </div>
   )
})

export default Step0_SelectIssue
