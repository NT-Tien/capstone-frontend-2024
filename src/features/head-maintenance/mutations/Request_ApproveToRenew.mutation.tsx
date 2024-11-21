import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Request_ApproveRenew, { Request, Response } from "../api/request/approve.renew.api"
import HeadStaff_Task_UpdateAssignFixer from "@/features/head-maintenance/api/task/update-assignFixer.api"
import { useQueryClient } from "@tanstack/react-query"
import HeadStaff_Users_AllStaff from "@/features/head-maintenance/api/users/all.api"
import HeadStaff_Users_AllStaffAvailable from "@/features/head-maintenance/api/users/all-available.api"
import { UserDto } from "@/lib/domain/User/User.dto"
import head_maintenance_queries from "@/features/head-maintenance/queries"
import { DismantleOldDeviceTypeErrorId, InstallNewDeviceTypeErrorId } from "@/lib/constants/Warranty"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_ApproveToRenew(props?: Props) {
   const queryClient = useQueryClient()
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         const approve = await HeadStaff_Request_ApproveRenew(req)
         const currentDate = new Date().toISOString()
         const allStaffWithTasks = await HeadStaff_Users_AllStaffAvailable({ fixDate: currentDate })

         const staffWithSmallest = allStaffWithTasks.reduce(
            (prev, curr) => {
               if (curr.tasks.length < prev.count) {
                  prev.staff = [curr]
                  prev.count = curr.tasks.length
               } else if (curr.tasks.length === prev.count) {
                  prev.staff.push(curr)
               }
               return prev
            },
            {
               staff: [],
               count: 0,
            } as {
               staff: UserDto[]
               count: number
            },
         )

         const randomStaff = staffWithSmallest.staff[Math.floor(Math.random() * staffWithSmallest.staff.length)]

         console.log(randomStaff)

         // get task id
         const fullRequest = await queryClient.fetchQuery(
            head_maintenance_queries.request.one.queryOptions({ id: req.id }),
         )

         console.log(fullRequest)
         
         const task = fullRequest.tasks.filter((t) =>
            t.issues.find(
               (i) =>
                  i.typeError.id === DismantleOldDeviceTypeErrorId || i.typeError.id === InstallNewDeviceTypeErrorId,
            ),
         )[0]

         const assign = await HeadStaff_Task_UpdateAssignFixer({
            id: task.id,
            payload: {
               fixer: randomStaff.id,
               fixerDate: currentDate,
               priority: false,
            },
         })

         return approve
      },
      mutationKey: ["head-maintenance", "request", "approve-to-renew"],
   })
}
