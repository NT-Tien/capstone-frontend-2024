import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import AuthTokens from "@/lib/constants/AuthTokens"
import Stockkeeper_Task_ReceiveSpareParts from "@/features/stockkeeper/api/task/receive-spare-parts.api"

type Request = {
   taskIds: string[]
}

type Response = {
   tasks: RequestDto[]
}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTask_ConfirmReceipt(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         if (!req.taskIds) {
            throw new Error("Yêu cầu không được để trống")
         }

         const response = await Promise.allSettled(
            req.taskIds.map((req) => {
               return Stockkeeper_Task_ReceiveSpareParts({
                  id: req,
                  token: AuthTokens.Stockkeeper,
                  payload: {
                     stockkeeper_signature: "sim",
                     staff_signature: "sim",
                  },
               })
            }),
         )

         const tasks = response.filter((res) => res.status === "fulfilled").map((res: any) => res.value)
         const errors = response.filter((res) => res.status === "rejected").map((res: any) => res.reason)

         if (errors.length > 0) {
            throw new Error("Có lỗi xảy ra")
         }

         return { tasks }
      },
      mutationKey: ["simulation", "task", "confirm-receipt"],
   })
}
