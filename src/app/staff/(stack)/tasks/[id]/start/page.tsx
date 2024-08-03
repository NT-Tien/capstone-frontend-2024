"use client"

import Cookies from "js-cookie"
import { File_Image_Upload } from "@/_api/file/upload_image.api"
import staff_qk from "@/app/staff/_api/qk"
import Staff_Task_OneById from "@/app/staff/_api/task/one-byId.api"
import Staff_Task_ReceiveSpareParts from "@/app/staff/_api/task/receive-spare-parts.api"
import Staff_Task_UpdateFinish from "@/app/staff/_api/task/update-finish.api"
import IssueDetailsDrawer from "@/app/staff/_components/IssueDetails.drawer"
import StaffScanner from "@/app/staff/_components/StaffScanner"
import DataListView from "@/common/components/DataListView"
import ImageWithCrop from "@/common/components/ImageWithCrop"
import ModalConfirm from "@/common/components/ModalConfirm"
import RootHeader from "@/common/components/RootHeader"
import ScannerDrawer from "@/common/components/Scanner.drawer"
import { FixRequestIssueDto } from "@/common/dto/FixRequestIssue.dto"
import { TaskDto } from "@/common/dto/Task.dto"
import { FixTypeTagMapper } from "@/common/enum/fix-type.enum"
import { IssueStatusEnum, IssueStatusEnumTagMapper } from "@/common/enum/issue-status.enum"
import checkImageUrl from "@/common/util/checkImageUrl.util"
import { cn } from "@/common/util/cn.util"
import { clientEnv } from "@/env"
import { HomeOutlined, RightOutlined } from "@ant-design/icons"
import { CheckCard } from "@ant-design/pro-card"
import { ProDescriptions, ProFormItem, ProFormTextArea } from "@ant-design/pro-components"
import { MapPin } from "@phosphor-icons/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
   App,
   Badge,
   Button,
   Card,
   Checkbox,
   Drawer,
   Form,
   List,
   message,
   Popconfirm,
   QRCode,
   Result,
   Spin,
   Tabs,
   Tag,
   Tooltip,
   Typography,
   Upload,
} from "antd"
import { RcFile, UploadFile } from "antd/es/upload"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { CSSProperties, useEffect, useMemo, useState } from "react"
import { File_Video_Upload } from "@/_api/file/upload_video.api"
import { TaskStatus } from "@/common/enum/task-status.enum"
import Step0 from "@/app/staff/(stack)/tasks/[id]/start/Step0.component"
import Step1 from "@/app/staff/(stack)/tasks/[id]/start/Step1.component"
import Step2 from "@/app/staff/(stack)/tasks/[id]/start/Step2.component"

export default function StartTask({ params }: { params: { id: string } }) {
   const [currentStep, setCurrentStep] = useState<number>(1)
   const router = useRouter()

   const response = useQuery({
      queryKey: staff_qk.task.one_byId(params.id),
      queryFn: () => Staff_Task_OneById({ id: params.id }),
   })

   return (
      <div className="std-layout">
         <RootHeader title="Thông tin chi tiết" className="std-layout-outer p-4" />
         {currentStep === -1 && <Spin fullscreen={true} />}
         {currentStep === 0 && (
            <Step0
               data={response.data?.issues ?? []}
               id={params.id}
               handleBack={() => router.push("/staff/tasks")}
               handleNext={() => setCurrentStep((prev) => prev + 1)}
               confirmReceipt={response.data?.confirmReceipt ?? false}
            />
         )}
         {currentStep === 1 && (
            <Step1
               handleBack={() => setCurrentStep((prev) => prev - 1)}
               handleNext={() => setCurrentStep((prev) => prev + 1)}
               refetch={response.refetch}
               data={response.data}
               loading={response.isLoading}
               id={params.id}
            />
         )}
         {currentStep === 2 && (
            <Step2
               id={params.id}
               handleBack={() => setCurrentStep((prev) => prev - 1)}
               handleNext={() => {
                  router.push("/staff/tasks")
               }}
            />
         )}
      </div>
   )
}

export type GeneralProps = {
   style?: CSSProperties
   className?: string
   handleNext?: () => void
   handleBack?: () => void
}
