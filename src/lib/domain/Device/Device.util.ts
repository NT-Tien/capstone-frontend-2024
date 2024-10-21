import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import dayjs from "dayjs"

class DeviceUtil {
   static canBeWarranted(device?: DeviceDto): boolean {
      if (!device) return false
      if (!("machineModel" in device)) {
         throw new Error("Device is missing machine model")
      }
      const warrantyTerm = device.machineModel.warrantyTerm
      if (!warrantyTerm) return false
      const warrantyDate = dayjs(device.machineModel.warrantyTerm)
      if (!warrantyDate.isValid()) return false
      return dayjs().isBefore(warrantyDate)
   }
}

export default DeviceUtil
