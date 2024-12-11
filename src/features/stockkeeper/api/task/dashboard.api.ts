import api from "@/config/axios.config"
import { parseApiResponse } from "@/lib/utils/parseApiResponse.util"
import Cookies from "js-cookie"

export type Request = {
    from: string
    to: string
}

export type Response = {
    [key in "sparepartNeedAdded" | "taskDeviceNotYet" | "taskDeviceDone" | "taskSparePartNotYet" | "taskSparePartDone" | "hotFixDevice"]: number
}

async function Stockkeeper_Dashboard(req: Request): Promise<Response> {
    return api.get<Response>(Stockkeeper_Dashboard.URL(req), {
        transformResponse: (data) => parseApiResponse<any>(data, (res) => res.data),
        headers: {
            Authorization: `Bearer ${Cookies.get("token")}`
        }
    }).then((res) => res.data)
}

Stockkeeper_Dashboard.URL = (req: Request) => {
    return `/stockkeeper/notification/dashboard/${encodeURIComponent(req.from)}/${encodeURIComponent(req.to)}`
}

export default Stockkeeper_Dashboard