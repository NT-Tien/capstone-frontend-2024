const staff_uri = {
   navbar: {
      dashboard: "/S/dashboard",
      tasks: "/S/tasks",
      notifications: "/S/notifications",
   },
   stack: {
      tasks_id: (id: string) => `/S/tasks/${id}`,
      tasks_id_warranty: (id: string) => `/S/tasks/${id}/warranty`,
      task_id_renew: (id: string) => `/S/tasks/${id}/renew`
   },
}

export default staff_uri
