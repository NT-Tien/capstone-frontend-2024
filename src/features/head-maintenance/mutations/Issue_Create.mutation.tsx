import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import HeadStaff_Issue_CreateMany, { Request, Response } from "@/features/head-maintenance/api/issue/create-many.api"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useIssue_CreateMany(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_Issue_CreateMany,
      mutationKey: ["head-maintenance", "issue", "create-many"],
   })
}
