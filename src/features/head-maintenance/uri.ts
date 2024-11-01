const hm_uris = {
   navbar: {
      dashboard: "/HM/dashboard",
      requests: "/HM/requests",
      tasks: "/HM/tasks",
      notifications: "/HM/notifications",
   },
   stack: {
      requests_id: (id: string) => `/HM/requests/${id}`,
      requests_id_fix: (id: string) => `/HM/requests/${id}/fix`,
      requests_id_warranty: (id: string) => `/HM/requests/${id}/warranty`,
      requests_id_renew: (id: string) => `/HM/requests/${id}/renew`,
      tasks_id: (id: string) => `/HM/tasks/${id}`,
   },
}

export default hm_uris
