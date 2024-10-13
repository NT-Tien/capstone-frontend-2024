import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import AuthTokens from "@/lib/constants/AuthTokens"
import Head_Request_UpdateClose from "@/features/head-department/api/request/update-close.api"

type Request = {
   requests: RequestDto[]
}

type Response = {
   requests: RequestDto[]
}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_Feedback(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         if (!req.requests) {
            throw new Error("Yêu cầu không được để trống")
         }

         const response = await Promise.allSettled(
            req.requests.map(async (request) => {
               const requester = request.requester.username
               const requesterToken = AuthTokens.Head_Department[requester as keyof typeof AuthTokens.Head_Department]

               console.log(requester, requesterToken)

               return await Head_Request_UpdateClose({
                  token: requesterToken,
                  payload: {
                     content: "Yêu cầu đã được xác nhận bởi trưởng phòng",
                  },
                  id: request.id,
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
      mutationKey: ["simulation", "request", "feedback"],
   })
}
