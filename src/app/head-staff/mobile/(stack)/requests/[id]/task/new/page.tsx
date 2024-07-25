"use client"

import headstaff_qk from "@/app/head-staff/_api/qk"
import HeadStaff_Request_OneById from "@/app/head-staff/_api/request/oneById.api"
import Step0_SelectIssue from "@/app/head-staff/mobile/(stack)/requests/[id]/task/new/Step0_SelectIssue.component"
import Step1_CreateTask from "@/app/head-staff/mobile/(stack)/requests/[id]/task/new/Step1_CreateTask.component"
import Step2_ConfirmTask from "@/app/head-staff/mobile/(stack)/requests/[id]/task/new/Step2_ConfirmTask.component"
import RootHeader from "@/common/components/RootHeader"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { UserDto } from "@/common/dto/User.dto"
import { NotFoundError } from "@/common/error/not-found.error"
import { ArrowLeftOutlined, LeftOutlined, LoadingOutlined } from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { App, Button, ButtonProps, Result, Spin, Steps } from "antd"
import { Dayjs } from "dayjs"
import { useRouter } from "next/navigation"
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react"

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
   const { message } = App.useApp()

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
      retry: false,
   })

   async function handleResetAll() {
      await api.refetch()
      setSelectedIssues({})
      setSelectedFixDate(undefined)
      setSelectedFixer(undefined)
      setSelectedPriority(false)
      setSelectedTaskName(undefined)

      setStep(0)
   }

   useEffect(() => {
      if (api.isSuccess) {
         if (api.data.issues.every((issue) => issue.task !== null)) {
            router.push(`/head-staff/mobile/requests/${params.id}`)
            message.info("Tất cả các lỗi đã được tạo tác vụ").then()
            return
         }
      }
   }, [api.data, api.isSuccess, message, params.id, router])

   if (api.error instanceof NotFoundError) {
      router.push(`/head-staff/mobile/requests`)
      message.error("Yêu cầu không tồn tại").then()
      return null
   }

   if (api.isPending) {
      return <Spin fullscreen />
   }

   return (
      <PageContext.Provider
         value={{
            setStep,
            setNextBtnProps,
            setPrevBtnProps,
         }}
      >
         {api.isError ? (
            <div className="grid h-full place-content-center">
               {api.error instanceof NotFoundError ? (
                  <Result
                     title="Không tìm thấy yêu cầu"
                     subTitle="Chúng tôi không thể tìm thấy yêu cầu này"
                     status="error"
                     extra={
                        <div className="flex items-center justify-center gap-3">
                           <Button
                              type="primary"
                              icon={<ArrowLeftOutlined />}
                              onClick={() => router.push("/head-staff/mobile/requests")}
                           >
                              Quay lại
                           </Button>
                           <Button type="primary" onClick={() => api.refetch()} icon={<LoadingOutlined />}>
                              Thử lại
                           </Button>
                        </div>
                     }
                  />
               ) : (
                  <Result
                     title="Lỗi"
                     subTitle="Đã có lỗi xảy ra khi tải dữ liệu"
                     status="error"
                     extra={
                        <div className="flex items-center justify-center gap-3">
                           <Button
                              type="primary"
                              icon={<ArrowLeftOutlined />}
                              onClick={() => router.push("/head-staff/mobile/requests")}
                           >
                              Quay lại
                           </Button>
                           <Button type="primary" onClick={() => api.refetch()} icon={<LoadingOutlined />}>
                              Thử lại
                           </Button>
                        </div>
                     }
                  />
               )}
            </div>
         ) : (
            <>
               <div className="h-max min-h-screen-with-navbar">
                  <div className="std-layout">
                     <RootHeader
                        title="Tác vụ mới"
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
                                 title: "Chọn vấn đề",
                              },
                              {
                                 title: "Tạo tác vụ",
                              },
                              {
                                 title: "Phân công",
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
                              resetAll={handleResetAll}
                           />
                        )}
                     </main>
                  </div>
               </div>
               <footer className="std-layout-outer sticky bottom-0 left-0 flex h-navbar w-full items-center justify-between gap-3 bg-white p-layout shadow-fb">
                  <Button size="large" type="default" {...prevBtnProps}></Button>
                  <Button size="large" type="primary" className="w-full" iconPosition="end" {...nextBtnProps}></Button>
               </footer>
            </>
         )}
      </PageContext.Provider>
   )
}
