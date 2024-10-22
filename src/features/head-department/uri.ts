const hd_uris = {
   navbar: {
      dashboard: "/head/dashboard",
      history: "/head/history",
      scan: "/head/scan",
   },
   stack: {
      history_id: (id: string) => `/head/history/${id}`,
   },
}

export default hd_uris
