enum Staff_NotificationIdentifiers {
   TASK_ASSIGNED = "task_assigned",
}

function NotificationsIdentifierMapper(identifier: string) {
   switch (identifier) {
      case Staff_NotificationIdentifiers.TASK_ASSIGNED:
         return {
            title: () => `Bạn đã được phân công một tác vụ`,
         }
   }
}

export default Staff_NotificationIdentifiers
export { NotificationsIdentifierMapper }
