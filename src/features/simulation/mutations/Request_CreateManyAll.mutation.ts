import useCustomMutation from "@/lib/hooks/useCustomMutation"
import { CustomMutationHookProps } from "@/lib/types/CustomMutationHookProps"
import Head_Request_Create, { type Request as CreateRequest } from "@/features/head-department/api/request/create.api"
import { RequestDto } from "@/lib/domain/Request/Request.dto"
import App from "antd/es/app"
import AuthTokens from "@/lib/constants/AuthTokens"
import { useQueryClient } from "@tanstack/react-query"
import admin_queries from "@/features/admin/queries"
import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import RequestErrors from "@/lib/domain/Request/RequestErrors"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"
import dayjs from "dayjs"

type Request = {
   no_fix: number
   no_warranty: number
}

type Response = {
   fixRequests: RequestDto[]
   warrantyRequests: RequestDto[]
}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_CreateManyAll(props?: Props) {
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         const listErrors = RequestErrors.slice(1)
            .map((err) => err.options)
            .flat()
            .map((err) => err?.value ?? "")

         //#region fetch devices
         const allDevices = await queryClient.ensureQueryData(
            admin_queries.device.all_filterAndSort.queryOptions({
               page: 1,
               limit: 5000,
               token: AuthTokens.Admin,
            }),
         )

         const ignoreRequests = await queryClient.ensureQueryData(
            admin_queries.request.all_filterAndSort.queryOptions({
               page: 1,
               limit: 5000,
               token: AuthTokens.Admin,
               filters: {
                  status: FixRequestStatus.PENDING,
               },
            }),
         )
         const ignoreRequests2 = await queryClient.ensureQueryData(
            admin_queries.request.all_filterAndSort.queryOptions({
               page: 1,
               limit: 5000,
               token: AuthTokens.Admin,
               filters: {
                  status: FixRequestStatus.IN_PROGRESS,
               },
            }),
         )

         const ignoreDevices = new Set([
            ...ignoreRequests.list.map((req) => req.device.id),
            ...ignoreRequests2.list.map((req) => req.device.id),
         ])
         let availableDevices = allDevices.list.filter(
            (device) =>
               !ignoreDevices.has(device.id) && !!device.positionX && !!device.positionY && !!device.area?.name,
         )
         //#endregion

         let fixDevices = availableDevices.filter(
               (device) =>
                  !device.machineModel.warrantyTerm || dayjs(device.machineModel.warrantyTerm).isBefore(dayjs()),
            ),
            warrantyDevices = availableDevices.filter(
               (device) => device.machineModel.warrantyTerm && dayjs(device.machineModel.warrantyTerm).isAfter(dayjs()),
            )

         if (fixDevices.length < req.no_fix || warrantyDevices.length < req.no_warranty) {
            throw new Error(`Không đủ thiết bị để tạo yêu cầu`)
         }

         const fixRequests = Array.from({ length: req.no_fix }).map(() => {
            let result = generateRandomRequest(fixDevices, listErrors)
            fixDevices = fixDevices.filter((device) => device.id !== result.device)
            return result
         })

         const warrantyRequests = Array.from({ length: req.no_warranty }).map(() => {
            let result = generateRandomRequest(warrantyDevices, listErrors)
            warrantyDevices = warrantyDevices.filter((device) => device.id !== result.device)
            return result
         })

         const fixResponse = await Promise.allSettled(
            fixRequests.map((request) => {
               return Head_Request_Create(request)
            }),
         )

         const warrantyResponse = await Promise.allSettled(
            warrantyRequests.map((request) => {
               return Head_Request_Create(request)
            }),
         )

         const fixRequestsList = fixResponse.filter((res) => res.status === "fulfilled").map((res: any) => res.value)
         const warrantyRequestsList = warrantyResponse
            .filter((res) => res.status === "fulfilled")
            .map((res: any) => res.value)
         const errors = fixResponse
            .concat(warrantyResponse)
            .filter((res) => res.status === "rejected")
            .map((res: any) => res.reason)

         if (errors.length === req.no_fix + req.no_warranty) {
            throw new Error("Tất cả yêu cầu đều thất bại")
         }

         if (errors.length > 0) {
            message.error(`${errors.length} requests failed to create`)
         }

         return {
            fixRequests: fixRequestsList,
            warrantyRequests: warrantyRequestsList,
         }
      },
      mutationKey: ["simulation", "request", "create-many-all"],
   })
}

function generateRandomRequest(devicesList: DeviceDto[], listErrors: string[]): CreateRequest {
   const tokens = Object.values(AuthTokens.Head_Department)
   return {
      token: tokens[Math.floor(Math.random() * tokens.length)],
      device: devicesList[Math.floor(Math.random() * devicesList.length)].id,
      requester_note: `${listErrors[Math.floor(Math.random() * listErrors.length)]} - SIM`,
   }
}
