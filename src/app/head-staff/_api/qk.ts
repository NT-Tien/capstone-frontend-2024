const headstaff_qk = {
   request: {
      all: (props: { page: string; limit: string; status: string }) => ["headstaff", "request", "all", props],
      byId: (id: string) => ["headstaff", "request", "byId", id],
   },
   task: {
      all: (props: { page: string; limit: string; status: string }) => ["headstaff", "task", "all", props],
   },
   device: {
      byId: (id: string) => ["headstaff", "device", "byId", id],
   },
}

export default headstaff_qk
