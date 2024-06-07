const qk = {
   users: {
      all: () => ["users"],
      byId: (id: number) => ["users", id],
   },
   areas: {
      all: () => ["areas"],
   },
   positions: {
      all: () => ["positions"],
   },
   machineModels: {
      all: () => ["machine-model"],
   },
   devices: {
      all: () => ["devices"],
   },
   spareParts: {
      all: () => ["spare-parts"],
   },
   issueRequests: {
      all: () => ["issue-requests"],
      byId: (id: string) => ["issue-requests", id],
   },
}

export default qk
