enum HeadMaintenance_NotificationIdentifiers {
   REQUEST_CREATED = "request_created",
   TASK_STARTED = "task_started",
}

function NotificationsIdentifierMapper(identifier: string) {
   switch (identifier) {
      case HeadMaintenance_NotificationIdentifiers.REQUEST_CREATED:
         return {
            title: (name: string) => `${name} đã tạo một yêu cầu`,
         }
      case HeadMaintenance_NotificationIdentifiers.TASK_STARTED:
         return {
            title: (name: string) => `Đã bắt đầu thực hiện tác vụ: ${name}`,
         }
   }
}

export default HeadMaintenance_NotificationIdentifiers
export { NotificationsIdentifierMapper }
