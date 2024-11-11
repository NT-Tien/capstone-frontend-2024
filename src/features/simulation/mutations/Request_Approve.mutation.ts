import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import AuthTokens from "@/lib/constants/AuthTokens"
import HeadStaff_Issue_CreateMany from "@/features/head-maintenance/api/issue/create-many.api"
import { FixType } from "@/lib/domain/Issue/FixType.enum"
import { useQueryClient } from "@tanstack/react-query"
import HeadStaff_TypeError_Common from "@/features/head-maintenance/api/type-error/common.api"
import HeadStaff_Device_OneById from "@/features/head-maintenance/api/device/one-byId.api"
import { ReceiveWarrantyTypeErrorId, DismantleOldDeviceTypeErrorId, SendWarrantyTypeErrorId } from "@/lib/constants/Warranty"

type Request = {
   requests: RequestDto[]
   numbers?: {
      no_issues?: number
      no_spareParts?: number
   }
}

type Response = {
   requests: RequestDto[]
}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_Approve(props?: Props) {
   const queryClient = useQueryClient()

   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         if (!req.requests) {
            throw new Error("Yêu cầu không được để trống")
         }

         let typeErrors = await queryClient.ensureQueryData({
            queryKey: ["head-maintenance", "type-error", "common"],
            queryFn: () =>
               HeadStaff_TypeError_Common({
                  token: AuthTokens.Head_Maintenance,
               }),
         })
         typeErrors = typeErrors.filter(
            (typeError) =>
               !new Set([SendWarrantyTypeErrorId, ReceiveWarrantyTypeErrorId, DismantleOldDeviceTypeErrorId]).has(
                  typeError.id,
               ),
         )

         const response = await Promise.allSettled(
            req.requests.map(async (request) => {
               const issuesCount = req.numbers?.no_issues ?? 3
               const sparePartsCount = req.numbers?.no_spareParts ?? 1

               const device = await queryClient.ensureQueryData({
                  queryKey: ["head-maintenance", "device", "one", "id", request.device.id],
                  queryFn: () =>
                     HeadStaff_Device_OneById({
                        token: AuthTokens.Head_Maintenance,
                        id: request.device.id,
                     }),
               })

               return await HeadStaff_Issue_CreateMany({
                  request: request.id,
                  token: AuthTokens.Head_Maintenance,
                  issues: Array.from({ length: issuesCount }).map((_, index) => ({
                     description: `Mô tả lỗi #${index}`,
                     fixType: Object.values(FixType)[Math.floor(Math.random() * Object.values(FixType).length)],
                     spareParts: Array.from({ length: sparePartsCount }).map((_, index) => ({
                        sparePart:
                           device.machineModel.spareParts[
                              Math.floor(Math.random() * device.machineModel.spareParts.length)
                           ].id,
                        quantity: Math.floor(Math.random() * 10) + 1,
                     })),
                     typeError: typeErrors[index].id,
                  })),
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
      mutationKey: ["simulation", "request", "approve"],
   })
}
