enum HeadDepartment_NotificationsIdentifiers {
   REQUEST_APPROVED = "request_approved",
   REQUEST_REJECTED = "request_rejected",
}

function NotificationsIdentifierMapper(identifier: string) {
   switch (identifier) {
      case HeadDepartment_NotificationsIdentifiers.REQUEST_APPROVED:
         return {
            title: () => "Yêu cầu đã được xác nhận",
         }
      case HeadDepartment_NotificationsIdentifiers.REQUEST_REJECTED:
         return {
            title: () => "Yêu cầu đã bị từ chối",
         }
   }
}

export default HeadDepartment_NotificationsIdentifiers
export { NotificationsIdentifierMapper }
