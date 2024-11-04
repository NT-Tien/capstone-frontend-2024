export enum ExportStatus {
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
         }
      case ExportStatus.ACCEPTED:
         return {
            text: "Đã duyệt",
         }
      case ExportStatus.EXPORTED:
         return {
            text: "Đã xuất kho",
         }
      case ExportStatus.DELAY:
         return {
            text: "Chậm tiến độ",
         }
      case ExportStatus.CANCEL:
         return {
            text: "Đã hủy",
         }
   }
}
