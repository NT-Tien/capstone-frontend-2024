import {
   DisassembleDeviceTypeErrorId,
   ReceiveWarrantyTypeErrorId,
   SendWarrantyTypeErrorId,
} from "@/lib/constants/Warranty"
import dayjs, { Dayjs } from "dayjs"

export enum WarrantyFailedReasonsList {
   CANNOT_DISASSEMBLE = "Không thể tháo rời",
   SERVICE_CENTER_CLOSED = "Trung tâm bảo hành đóng cửa",
   WARRANTY_REJECTED_ON_ARRIVAL = "Trung tâm bảo hành từ chối nhận",
   WARRANTY_REJECTED_AFTER_PROCESS = "Từ chối bảo hành",
   CHANGE_RECEIVE_DATE = "Đổi ngày nhận máy",
   OTHER = "Khác",
}

export const WarrantyFailedGenerator = {
   [WarrantyFailedReasonsList.CHANGE_RECEIVE_DATE]: {
      failReason: (newDate: Dayjs, note: string) =>
         `${WarrantyFailedReasonsList.CHANGE_RECEIVE_DATE}: ${newDate.format("DD/MM/YYYY")}. Lý do: ${note}`,
      getDate: (failReason: string) => {
         const date = failReason.split(":")[1].split(".")[0].trim()
         return dayjs(date, "DD/MM/YYYY")
      },
   },
   ["default"]: {
      failReason: (reason: WarrantyFailedReasonsList, note: string) => {
         return `${reason}: ${note}`
      },
   },
}

const WarrantyFailedReasons = {
   [DisassembleDeviceTypeErrorId]: [
      {
         label: WarrantyFailedReasonsList.CANNOT_DISASSEMBLE,
         value: WarrantyFailedReasonsList.CANNOT_DISASSEMBLE,
      },
      {
         label: WarrantyFailedReasonsList.OTHER,
         value: WarrantyFailedReasonsList.OTHER,
      },
   ],
   [SendWarrantyTypeErrorId]: [
      {
         label: WarrantyFailedReasonsList.SERVICE_CENTER_CLOSED,
         value: WarrantyFailedReasonsList.SERVICE_CENTER_CLOSED,
      },
      {
         label: WarrantyFailedReasonsList.WARRANTY_REJECTED_ON_ARRIVAL,
         value: WarrantyFailedReasonsList.WARRANTY_REJECTED_ON_ARRIVAL,
      },
      {
         label: WarrantyFailedReasonsList.OTHER,
         value: WarrantyFailedReasonsList.OTHER,
      },
   ],
   [ReceiveWarrantyTypeErrorId]: [
      {
         label: WarrantyFailedReasonsList.WARRANTY_REJECTED_AFTER_PROCESS,
         value: WarrantyFailedReasonsList.WARRANTY_REJECTED_AFTER_PROCESS,
      },
      {
         label: WarrantyFailedReasonsList.CHANGE_RECEIVE_DATE,
         value: WarrantyFailedReasonsList.CHANGE_RECEIVE_DATE,
      },
      {
         label: WarrantyFailedReasonsList.OTHER,
         value: WarrantyFailedReasonsList.OTHER,
      },
   ],
}

export default WarrantyFailedReasons
