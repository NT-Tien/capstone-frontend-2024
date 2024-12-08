export enum ExportStatus {
   WAITING_ADMIN = "WAITING_ADMIN",
   ADMIN_REJECT = "ADMIN_REJECT",
   WAITING = "WAITING",
   DELAY = "DELAY",
   ACCEPTED = "ACCEPTED",
   EXPORTED = "EXPORTED",
   CANCEL = "CANCEL",
}

export function ExportStatusMapper(status?: ExportStatus) {
   if (!status) return null

   switch (status) {
      case ExportStatus.WAITING:
         return {
            text: "Chưa xử lý",
            color: "yellow",
         }
      case ExportStatus.WAITING_ADMIN:
         return {
            text: "Chờ quản trị viên duyệt",
            color: "yellow",
         }
      case ExportStatus.ADMIN_REJECT:
         return {
            text: "Quản trị viên từ chối",
            color: "red",
         }
      case ExportStatus.WAITING:
         return {
            text: "Chưa xử lý",
            color: "yellow",
         }
      case ExportStatus.ACCEPTED:
         return {
            text: "Đã duyệt",
            color: "green",
         }
      case ExportStatus.EXPORTED:
         return {
            text: "Đã xuất kho",
            color: "blue",
         }
      case ExportStatus.DELAY:
         return {
            text: "Chậm tiến độ",
            color: "orange",
         }
      case ExportStatus.CANCEL:
         return {
            text: "Đã hủy",
            color: "red",
         }
   }
}
