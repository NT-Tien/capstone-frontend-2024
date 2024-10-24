const staff_uri = {
   navbar: {
      dashboard: "/staff/dashboard",
      tasks: "/staff/tasks",
   },
   stack: {
      tasks_id: (id: string) => `/staff/tasks/${id}/start`,
   },
}

export default staff_uri
