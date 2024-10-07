import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import AuthTokens from "@/lib/constants/AuthTokens"
import HeadStaff_Request_UpdateStatus from "@/features/head-maintenance/api/request/updateStatus.api"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"

type Request = {
   requestIds: string[]
}

type Response = {
   requests: RequestDto[]
}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_Reject(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         if (!req.requestIds) {
            throw new Error("Yêu cầu không được để trống")
         }

         const response = await Promise.allSettled(
            req.requestIds.map((req) => {
               return HeadStaff_Request_UpdateStatus({
                  id: req,
                  token: AuthTokens.Head_Maintenance,
                  payload: {
                     status: FixRequestStatus.REJECTED,
                  },
               })
            }),
         )

         const requests = response.filter((res) => res.status === "fulfilled").map((res: any) => res.value)
         const errors = response.filter((res) => res.status === "rejected").map((res: any) => res.reason)

         if (errors.length > 0) {
            throw new Error("Có lỗi xảy ra")
         }

         return { requests }
      },
      mutationKey: ["simulation", "request", "update-seen"],
   })
}
