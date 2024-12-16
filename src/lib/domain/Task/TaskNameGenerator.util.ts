import { RequestDto } from "@/lib/domain/Request/Request.dto"
import dayjs from "dayjs"

class TaskNameGenerator {
   static generateFix(request: RequestDto) {
      const date = dayjs(request.createdAt).format("DDMMYYYY").toString()
      const no_issues = request?.issues.length.toString() ?? ""
      const areaName = request?.device?.area?.name ?? ""
      const randomCharacters = Math.random().toString(36).substring(0, 6)
      const requestCodeSplit = request.code.split('_');
      const requestCodeUnique = requestCodeSplit[requestCodeSplit.length - 1];

      return `${date}_SC${no_issues}_${areaName}_${requestCodeUnique}_${randomCharacters.toUpperCase()}`
   }

   static generateWarranty(request: RequestDto) {
      const date = dayjs(request.createdAt).format("DDMMYYYY").toString()
      const no_issues = request?.issues.length.toString() ?? '';
      const areaName = request?.device?.area?.name ?? '';
      const randomCharacters = Math.random().toString(36).substring(0, 6);
      const requestCodeSplit = request.code.split('_');
      const requestCodeUnique = requestCodeSplit[requestCodeSplit.length - 1];
  
      return `${date}_BH${no_issues}_${areaName}_${requestCodeUnique}_${randomCharacters.toUpperCase()}`;
    }
  
    static generateRenew(request: RequestDto) {
      const date = dayjs(request.createdAt).format("DDMMYYYY").toString()
      const no_issues = request?.issues.length.toString() ?? '';
      const areaName = request?.device?.area?.name ?? '';
      const randomCharacters = Math.random().toString(36).substring(0, 6);
      const requestCodeSplit = request.code.split('_');
      const requestCodeUnique = requestCodeSplit[requestCodeSplit.length - 1];
  
      return `${date}_RN${no_issues}_${areaName}_${requestCodeUnique}_${randomCharacters.toUpperCase()}`;
    }
  
    static generateInstallReplacement(request: RequestDto) {
      const date = dayjs(request.createdAt).format("DDMMYYYY").toString()
      const no_issues = request?.issues.length.toString() ?? '';
      const areaName = request?.device?.area?.name ?? '';
      const randomCharacters = Math.random().toString(36).substring(0, 6);
      const requestCodeSplit = request.code.split('_');
      const requestCodeUnique = requestCodeSplit[requestCodeSplit.length - 1];
  
      return `${date}_IR${no_issues}_${areaName}_${requestCodeUnique}_${randomCharacters.toUpperCase()}`;
    }
}

export default TaskNameGenerator