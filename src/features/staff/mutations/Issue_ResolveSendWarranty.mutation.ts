import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Staff_Issue_UpdateFinish from "@/features/staff/api/issue/update-finish"
import Staff_Request_UpdateWarrantyDate from "@/features/staff/api/request/update-warranty-date.api"

type Request = {
   id: string
   payload: {
      requestId: string
      images: string[]
      date: string
      coordinates: GeolocationCoordinates
   }
}
type Response = {}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useIssue_ResolveSendWarranty(props?: Props) {
   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         await Staff_Issue_UpdateFinish({
            id: req.id,
            payload: {
               imagesVerify: req.payload.images,
               resolvedNote: JSON.stringify(req.payload.coordinates, null, 2),
            },
         })

         await Staff_Request_UpdateWarrantyDate({
            id: req.payload.requestId,
            payload: {
               warrantyDate: req.payload.date,
            },
         })
         return {}
      },
      mutationKey: ["staff", "issue", "resolve-send-warranty"],
   })
}
