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
}

export default qk
