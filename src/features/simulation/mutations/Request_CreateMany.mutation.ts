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

type Request = {
   count: number
}

type Response = {
   requests: RequestDto[]
}

type Props = CustomMutationHookProps<Response, unknown, Request, unknown>
export default function useRequest_CreateMany(props?: Props) {
   const { message } = App.useApp()
   const queryClient = useQueryClient()

   return useCustomMutation({
      options: props ?? null,
      mutationFn: async (req: Request) => {
         if (!req.count) {
            throw new Error("Số lượng yêu cầu không được để trống")
         }

         const listErrors = RequestErrors.slice(1)
            .map((err) => err.options)
            .flat()
            .map((err) => err?.value ?? "")

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
         const ignoreDevices = new Set(ignoreRequests.list.map((req) => req.device.id))
         let deviceList = allDevices.list.filter((device) => !ignoreDevices.has(device.id))

         const rawRequests = Array.from({ length: req.count }).map(() => {
            let result = generateRandomRequest(deviceList, listErrors)
            deviceList = deviceList.filter((device) => device.id !== result.device)
            return result
         })

         const response = await Promise.allSettled(
            rawRequests.map((request) => {
               return Head_Request_Create(request)
            }),
         )

         const requests = response.filter((res) => res.status === "fulfilled").map((res: any) => res.value)
         const errors = response.filter((res) => res.status === "rejected").map((res: any) => res.reason)

         if (errors.length === req.count) {
            throw new Error("Tất cả yêu cầu đều thất bại")
         }

         if (errors.length > 0) {
            message.error(`${errors.length} requests failed to create`)
         }

         return {
            requests,
         }
      },
      mutationKey: ["simulation", "request", "create-many"],
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
