const staff_uri = {
   navbar: {
      dashboard: "/S/dashboard",
      tasks: "/S/tasks",
      notifications: "/S/notifications",
   },
   stack: {
      tasks_id: (id: string) => `/S/tasks/${id}`,
   },
}

export default staff_uri
