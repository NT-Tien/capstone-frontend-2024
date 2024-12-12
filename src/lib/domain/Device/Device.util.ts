import { DeviceDto } from "@/lib/domain/Device/Device.dto"
import { FE_DeviceStatus } from "@/lib/domain/Device/FE_DeviceStatus.enum"
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

   static getDeviceStatus(device?: DeviceDto) {
      if (!device) return

      if (device.isWarranty) return FE_DeviceStatus.WARRANTY_CENTER_PROCESSING

      if (device.area === null && device.positionX === null && device.positionY === null) {
         return FE_DeviceStatus.IN_WAREHOUSE
      }

      if (device.area !== null && device.positionX !== null && device.positionY !== null) {
         return FE_DeviceStatus.IN_PRODUCTION
      }

      if (!device.status) return FE_DeviceStatus.ON_HOLD
   }
}

export default DeviceUtil
