import { DisassembleDeviceTypeErrorId, ReceiveWarrantyTypeErrorId, SendWarrantyTypeErrorId } from "@/lib/constants/Warranty"

const WarrantyFailedReasons = {
   [DisassembleDeviceTypeErrorId]: [
      {
         label: "Không thể tháo rời",
         value: "Không thể tháo rời",
      },
      {
         label: "Khác",
         value: "Khác",
      },
   ],
   [SendWarrantyTypeErrorId]: [
      {
         label: "Trung tâm bảo hành đóng cửa",
         value: "Trung tâm bảo hành đóng cửa",
      },
      {
         label: "Trung tâm bảo hành từ chối nhận",
         value: "Trung tâm bảo hành từ chối nhận",
      },
      {
         label: "Khác",
         value: "Khác",
      },
   ],
   [ReceiveWarrantyTypeErrorId]: [
      {
         label: "Từ chối bảo hành",
         value: "Từ chối bảo hành",
      },
      {
         label: "Đổi ngày nhận máy",
         value: "Đổi ngày nhận máy",
      },
      {
         label: "Khác",
         value: "Khác",
      },
   ],
}

export default WarrantyFailedReasons
