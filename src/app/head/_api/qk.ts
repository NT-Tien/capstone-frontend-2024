const head_qk = {
   requests: {
      base: () => ["head", "requests"],
      all: () => ["head", "requests", "all"],
   },
   devices: {
      with_requests: (id: string) => ["head", "devices", id, "with_requests"],
      by_id: (id: string) => ["head", "devices", id],
   },
}

export default head_qk
