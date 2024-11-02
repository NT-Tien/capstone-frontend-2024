import { RequestDto } from "@/lib/domain/Request/Request.dto"
import dayjs from "dayjs"

class TaskNameGenerator {
   static generateFix(request: RequestDto) {
      const date = dayjs(request.createdAt).format("DDMMYYYY").toString()
      const no_issues = request?.issues.length.toString() ?? ""
      const machineModelName = request?.device?.machineModel?.name ?? ""
      const areaName = request?.device?.area?.name ?? ""
      const randomCharacters = Math.random().toString(36).substring(2, 6)

      return `${date}_SC${no_issues}_${areaName}_${machineModelName}_${randomCharacters}`
   }

   static generateWarranty(request: RequestDto) {
      const date = dayjs(request.createdAt).format("DDMMYYYY").toString()
      const no_issues = request?.issues.length.toString() ?? ""
      const machineModelName = request?.device?.machineModel?.name ?? ""
      const areaName = request?.device?.area?.name ?? ""
      const randomCharacters = Math.random().toString(36).substring(2, 6)

      return `${date}_BH${no_issues}_${areaName}_${machineModelName}_${randomCharacters}`
   }

   static generateRenew(request: RequestDto) {
      const date = dayjs(request.createdAt).format("DDMMYYYY").toString()
      const no_issues = request?.issues.length.toString() ?? ""
      const machineModelName = request?.device?.machineModel?.name ?? ""
      const areaName = request?.device?.area?.name ?? ""
      const randomCharacters = Math.random().toString(36).substring(2, 6)

      return `${date}_TM${no_issues}_${areaName}_${machineModelName}_${randomCharacters}`
   }
}

export default TaskNameGenerator