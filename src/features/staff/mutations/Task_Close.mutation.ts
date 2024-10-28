import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Staff_Task_UpdateFinish, { Request as FnRequest, Response } from "@/features/staff/api/task/update-finish.api"

type Request = Omit<FnRequest, "payload">

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useTask_Close(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         return await Staff_Task_UpdateFinish({
            id: req.id,
            payload: {
               fixerNote: "Task closed",
               imagesVerify: [],
               videosVerify: "",
            },
         })
      },
      mutationKey: ["staff", "task", "finish"],
   })
}
