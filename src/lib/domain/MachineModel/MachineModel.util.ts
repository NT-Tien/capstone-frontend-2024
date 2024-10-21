import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import dayjs from "dayjs"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"

class MachineModelUtil {
   static canBeWarranted(machineModel?: MachineModelDto): boolean {
      const warrantyTerm = machineModel?.warrantyTerm
      if (!warrantyTerm) return false
      const warrantyDate = dayjs(machineModel.warrantyTerm)
      if (!warrantyDate.isValid()) return false
      return dayjs().isBefore(warrantyDate)
   }
}

export default MachineModelUtil
