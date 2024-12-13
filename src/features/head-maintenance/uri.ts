import { RequestDto } from "@/lib/domain/Request/Request.dto"
import { FixRequestStatus } from "@/lib/domain/Request/RequestStatus.enum"

const hm_uris = {
   navbar: {
      dashboard: "/HM/dashboard",
      requests: "/HM/requests",
      requests_query: (query?: {
         status?: FixRequestStatus
      }) => {
         const search = new URLSearchParams(query).toString()
         return "/HM/requests" + (search ? `?${search}` : "")
      },
      tasks: "/HM/tasks",
      notifications: "/HM/notifications",
      device: "/HM/device",
   },
   stack: {
      requests_id: (
         id: string,
         query?: {
            "prev-request"?: string
         },
      ) => {
         const search = new URLSearchParams(query).toString()
         return `/HM/requests/${id}` + (search ? `?${search}` : "")
      },
      requests_id_fix: (id: string) => `/HM/requests/${id}/fix`,
      requests_id_warranty: (id: string) => `/HM/requests/${id}/warranty`,
      requests_id_renew: (id: string) => `/HM/requests/${id}/renew`,
      tasks_id: (id: string) => `/HM/tasks/${id}`,
   },
   custom: {
      request_id_redirecter: (
         id: string,
         request: RequestDto,
         query?: {
            "prev-request"?: string
         },
      ) => {
         let baseUrl = ""
         if (request.status === FixRequestStatus.PENDING) {
            baseUrl = "/HM/requests"
         } else if (request.is_fix) {
            baseUrl = `/HM/requests/${id}/fix`
         } else if (request.is_warranty) {
            baseUrl = `/HM/requests/${id}/warranty`
         } else if (request.is_rennew) {
            baseUrl = `/HM/requests/${id}/renew`
         }

         const search = new URLSearchParams(query).toString()
         return baseUrl + (search ? `?${search}` : "")
      },
   },
}

export default hm_uris
