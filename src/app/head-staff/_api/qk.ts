const headstaff_qk = {
   request: {
      base: () => ["headstaff", "request"],
      all: (props?: { page: string; limit: string; status: string }) => ["headstaff", "request", "all", props],
      byId: (id: string) => ["headstaff", "request", "byId", id],
   },
   task: {
      base: () => ["headstaff", "task"],
      all: (props: { page: string; limit: string; status: string }) => ["headstaff", "task", "all", props],
      byId: (id: string) => ["headstaff", "task", "byId", id],
   },
   device: {
      byId: (id: string) => ["headstaff", "device", "byId", id],
      byIdWithHistory: (id: string) => ["headstaff", "device", id, "byIdWithHistory"],
   },
   issue: {
      byId: (id: string) => ["headstaff", "issue", "byId", id],
   },
   user: {
      all: () => ["headstaff", "user", "all"],
   },
}

export default headstaff_qk
