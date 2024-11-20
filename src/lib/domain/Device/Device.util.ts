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

   static mapToUniqueDevice(renewDevice?: DeviceDto[]) {
      if (!renewDevice) return undefined

      const returnValue: {
         [deviceId: string]: {
            device: DeviceDto
         }
      } = {}

      renewDevice.forEach((device_renew) => {
         const deviceId = device_renew.id
         if (!returnValue[deviceId]) {
            returnValue[deviceId] = {
               device: device_renew,
            }
         }
      })
      return Object.values(returnValue)
   }
}

export default DeviceUtil
