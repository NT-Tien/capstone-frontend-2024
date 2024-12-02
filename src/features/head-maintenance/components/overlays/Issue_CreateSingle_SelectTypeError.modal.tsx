import head_maintenance_mutations from "@/features/head-maintenance/mutations"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { SystemTypeErrorIds } from "@/lib/constants/Warranty"
import { IssueDto } from "@/lib/domain/Issue/Issue.dto"
import { IssueStatusEnum } from "@/lib/domain/Issue/IssueStatus.enum"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { TypeErrorDto } from "@/lib/domain/TypeError/TypeError.dto"
import { Modal, ModalProps, Select } from "antd"
import { useMemo, useRef, useState } from "react"
import Issue_CreateDetailsDrawer, { CreateSingleIssueDrawerRefType } from "./Issue_CreateDetails.drawer"

type Issue_CreateSingle_SelectTypeErrorModalProps = {
   deviceId?: string
   request?: RequestDto
   onFinish?: (result: IssueDto) => void
   returnResult?: boolean
}
type Props = Omit<ModalProps, "children"> &
   Issue_CreateSingle_SelectTypeErrorModalProps & {
      handleClose?: () => void
   }

function Issue_CreateSingle_SelectTypeErrorModal(props: Props) {
   const [selectedTypeErrorControl, setSelectedTypeErrorControl] = useState<string | null>(null)

   const createSingleIssueDrawerRef = useRef<CreateSingleIssueDrawerRefType | null>(null)

   const api_device = head_maintenance_queries.device.one(
      {
         id: props.deviceId ?? "",
      },
      {
         enabled: !!props.deviceId,
      },
   )

   const api_commonTypeErrors = head_maintenance_queries.typeError.common(
      {},
      {
         enabled: !!props.deviceId,
      },
   )

   const mutate_createIssues = head_maintenance_mutations.issue.createMany()

   const selectOptions = useMemo(() => {
      if (!api_device.isSuccess || !api_commonTypeErrors.isSuccess || !props.request) return []

      const allOptions = [...api_device.data.machineModel.typeErrors, ...api_commonTypeErrors.data]
      const existingOptions: Set<string> = SystemTypeErrorIds

      // cannot create two issues with the same typeError if issue is pending
      props.request?.issues.forEach((issue) => {
         if (issue.status === IssueStatusEnum.PENDING) {
            existingOptions.add(issue.typeError.id)
         }
      })

      return allOptions
         .filter((te) => !existingOptions.has(te.id))
         .map((te) => ({
            label: te.name,
            value: JSON.stringify(te),
         }))
   }, [
      api_commonTypeErrors.data,
      api_commonTypeErrors.isSuccess,
      api_device.data?.machineModel.typeErrors,
      api_device.isSuccess,
      props.request,
   ])

   function handleFinish(issue: IssueDto) {
      if (!props.request) return
      if (props.returnResult) {
         props.onFinish?.(issue)
         props.handleClose?.()
      } else {
         mutate_createIssues.mutate(
            {
               request: props.request.id,
               issues: [
                  {
                     description: issue.description,
                     fixType: issue.fixType,
                     typeError: issue.typeError.id,
                     spareParts: issue.issueSpareParts.map((sp) => ({
                        sparePart: sp.sparePart.id,
                        quantity: sp.quantity,
                     })),
                  },
               ],
            },
            {
               onSuccess: () => {
                  props.handleClose?.()
                  props.onFinish?.(issue)
               },
            },
         )
      }
   }

   return (
      <Modal
         title={
            <div className='mb-2'>
               <h1>Thêm lỗi mới</h1>
               <p className='text-sm text-neutral-500 font-base'>Vui lòng chọn trong số các lỗi sau</p>
            </div>
         }
         centered
         footer={false}
         {...props}
      >
         <Select
            className="w-full"
            allowClear
            showSearch
            variant="outlined"
            options={selectOptions}
            placeholder="Chọn loại lỗi"
            size="large"
            autoClearSearchValue
            value={selectedTypeErrorControl}
            onChange={(value) => {
               setSelectedTypeErrorControl(value)
               if (!api_device.isSuccess) return
               createSingleIssueDrawerRef.current?.handleOpen({
                  device: api_device.data,
                  typeError: JSON.parse(value as any) as TypeErrorDto,
               })
            }}
         />
         <Issue_CreateDetailsDrawer onFinish={handleFinish} ref={createSingleIssueDrawerRef} />
      </Modal>
   )
}

export default Issue_CreateSingle_SelectTypeErrorModal
export type { Issue_CreateSingle_SelectTypeErrorModalProps }
