const hm_uris = {
   navbar: {
      dashboard: "/HM/dashboard",
      requests: "/HM/requests",
   },
   stack: {
      requests_id: (id: string) => `/HM/requests/${id}`,
      requests_id_fix: (id: string) => `/HM/requests/${id}/fix`,
      requests_id_warranty: (id: string) => `/HM/requests/${id}/warranty`,
      requests_id_renew: (id: string) => `/HM/requests/${id}/renew`,
   },
}

export default hm_uris
