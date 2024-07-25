const staff_qk = {
   task: {
      base: () => ["staff", "task"],
      all: () => ["staff", "task", "all"],
      all_withPriorityFilter: (priority?: boolean) => ["staff", "task", "all", { priority }],
      one_byId: (id: string) => ["staff", "task", { id }],
   },
}

export default staff_qk;