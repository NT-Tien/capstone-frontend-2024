import HeadStaff_Request_WarrantyFailed, { Request, Response } from "@/features/head-maintenance/api/request/warranty-failed.api"
import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_WarrantyFailed(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: HeadStaff_Request_WarrantyFailed,
      mutationKey: ["head-maintenance", "request", "warranty-failed"],
   })
}
