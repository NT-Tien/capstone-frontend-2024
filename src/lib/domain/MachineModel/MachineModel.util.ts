import dayjs from "dayjs"
import { MachineModelDto } from "@/lib/domain/MachineModel/MachineModel.dto"

class MachineModelUtil {
   /**
    * Returns:
    * - `undefined` if `machineModel` is `undefined`
    * - `false` if `warrantyTerm` is `undefined` or `warrantyTerm` is not a valid date
    * - `true` if the current date is before the `warrantyTerm`
    * @param machineModel
    */
   static canBeWarranted(machineModel?: MachineModelDto): boolean | undefined {
      if (!machineModel) return undefined

      const warrantyTerm = machineModel?.warrantyTerm
      if (!warrantyTerm) return false
      const warrantyDate = dayjs(machineModel.warrantyTerm)
      if (!warrantyDate.isValid()) return false
      return dayjs().isBefore(warrantyDate)
   }
}

export default MachineModelUtil
