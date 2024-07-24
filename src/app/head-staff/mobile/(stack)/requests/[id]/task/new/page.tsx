"use client"

import RootHeader from "@/common/components/RootHeader"
import {
   ArrowLeftOutlined,
   ArrowRightOutlined,
   HomeOutlined,
   InfoCircleFilled,
   LeftOutlined,
   PlusOutlined,
   UploadOutlined,
} from "@ant-design/icons"
import React, { createContext, Dispatch, memo, SetStateAction, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { App, Button, ButtonProps, Card, Form, Input, Radio, Steps, Tag } from "antd"
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query"
import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"
import { CheckCard } from "@ant-design/pro-card"
import { FixType, FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { ProFormDatePicker, ProFormText } from "@ant-design/pro-components"
import dayjs, { Dayjs } from "dayjs"
import { UserDto } from "@/common/dto/User.dto"
import HeadStaff_Users_AllStaff from "@/app/head-staff/_api/users/all.api"
import { TaskDto } from "@/common/dto/Task.dto"
import HeadStaff_Task_Create, { Request as TaskCreateRequest } from "@/app/head-staff/_api/task/create.api"
import HeadStaff_Task_UpdateAssignFixer from "@/app/head-staff/_api/task/update-assignFixer.api"
import HeadStaff_Request_UpdateStatus from "@/app/head-staff/_api/request/updateStatus.api"
import { FixRequestStatus } from "@/common/enum/fix-request-status.enum"
import Step0_SelectIssue from "@/app/head-staff/mobile/(stack)/requests/[id]/task/new/Step0_SelectIssue.component"
import Step1_CreateTask from "@/app/head-staff/mobile/(stack)/requests/[id]/task/new/Step1_CreateTask.component"
import Step2_ConfirmTask from "@/app/head-staff/mobile/(stack)/requests/[id]/task/new/Step2_ConfirmTask.component"

type PageContextType = {
   setNextBtnProps: Dispatch<SetStateAction<ButtonProps>>
   setPrevBtnProps: Dispatch<SetStateAction<ButtonProps>>
   setStep: Dispatch<SetStateAction<number>>
}

const PageContext = createContext<PageContextType | undefined>(undefined)

export function usePageContext() {
   const context = useContext(PageContext)
   if (context === undefined) {
      throw new Error("usePageContext must be used within a PageContext")
   }
   return context
}

export type SelectedIssueType = { [key: string]: FixRequestIssueDto }

export default function NewTaskPage({ params }: { params: { id: string } }) {
   const router = useRouter()

   const [selectedIssues, setSelectedIssues] = useState<SelectedIssueType>({})
   const [selectedFixDate, setSelectedFixDate] = useState<Dayjs | undefined>()
   const [selectedFixer, setSelectedFixer] = useState<UserDto | undefined>()
   const [selectedPriority, setSelectedPriority] = useState<boolean>(false)
   const [selectedTaskName, setSelectedTaskName] = useState<string | undefined>()

   const [prevBtnProps, setPrevBtnProps] = useState<ButtonProps>({})
   const [nextBtnProps, setNextBtnProps] = useState<ButtonProps>({})
   const [step, setStep] = useState<number>(0)

   const api = useQuery({
      queryKey: headstaff_qk.request.byId(params.id),
      queryFn: () => HeadStaff_Request_OneById({ id: params.id }),
   })

   useEffect(() => {
      if (api.isSuccess)
         setSelectedTaskName(
            `${api.data!.device.machineModel.name}-${api.data!.device.area.name}-${api.data!.device.positionX}-${api.data!.device.positionY}`,
         )
   }, [])

   return (
      <PageContext.Provider
         value={{
            setStep,
            setNextBtnProps,
            setPrevBtnProps,
         }}
      >
         <div className="h-max min-h-screen-with-navbar">
            <div className="std-layout">
               <RootHeader
                  title="Create New Task"
                  icon={<LeftOutlined />}
                  onIconClick={() => router.back()}
                  className="std-layout-outer p-4"
               />
               <section className="std-layout-outer w-full bg-white shadow-bottom">
                  <Steps
                     size="default"
                     current={step}
                     progressDot
                     direction="horizontal"
                     responsive={false}
                     type="navigation"
                     items={[
                        {
                           title: "Select Issues",
                           onClick: () => setStep(0),
                        },
                        {
                           title: "Create Task",
                           onClick: () => setStep(1),
                        },
                        {
                           title: "Assign Fixer",
                           onClick: () => setStep(2),
                        },
                     ]}
                  />
               </section>
               <main className="h-full">
                  {step === 0 && (
                     <Step0_SelectIssue
                        api={api}
                        selectedIssues={selectedIssues}
                        setSelectedIssues={setSelectedIssues}
                     />
                  )}
                  {step === 1 && (
                     <Step1_CreateTask
                        api={api}
                        selectedFixDate={selectedFixDate}
                        setSelectedFixDate={setSelectedFixDate}
                        selectedPriority={selectedPriority}
                        setSelectedPriority={setSelectedPriority}
                        selectedTaskName={selectedTaskName}
                        setSelectedTaskName={setSelectedTaskName}
                     />
                  )}
                  {step === 2 && (
                     <Step2_ConfirmTask
                        api={api}
                        selectedPriority={selectedPriority}
                        selectedFixDate={selectedFixDate}
                        selectedFixer={selectedFixer}
                        selectedTaskName={selectedTaskName}
                        selectedIssues={selectedIssues}
                        setSelectedFixer={setSelectedFixer}
                     />
                  )}
               </main>
            </div>
         </div>
         <footer className="std-layout-outer sticky bottom-0 left-0 flex h-navbar w-full items-center justify-between gap-3 bg-white p-layout shadow-fb">
            <Button size="large" type="default" {...prevBtnProps}></Button>
            <Button size="large" type="primary" className="w-full" iconPosition="end" {...nextBtnProps}></Button>
         </footer>
      </PageContext.Provider>
   )
}
