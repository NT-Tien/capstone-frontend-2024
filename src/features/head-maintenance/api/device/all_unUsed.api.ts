import api from "@/config/axios.config"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"
import { AuthTokenWrapper } from "@/lib/types/AuthTokenWrapper"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

export type Request = {} & AuthTokenWrapper
export type Response = MachineModelDto[]

HeadStaff_Device_AllUnused.URL = (req: Request) => "/head-staff/device/all/unused"
export default async function HeadStaff_Device_AllUnused(req: Request): Promise<Response> {
   return api
      .get<Response>(HeadStaff_Device_AllUnused.URL(req), {
         transformResponse: (data) => parseApiResponse(data, (res) => res.data),
         headers: {
            Authorization: `Bearer ${req.token ?? Cookies.get("token")}`,
         },
      })
      .then((res) => res.data)
}
