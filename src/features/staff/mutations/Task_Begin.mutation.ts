import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Staff_Task_UpdateStart, { Request, Response } from "@/features/staff/api/task/update-start.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTask_BeginTask(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         return await Staff_Task_UpdateStart(req)
      },
      mutationKey: ["staff", "task", "begin"],
   })
}
