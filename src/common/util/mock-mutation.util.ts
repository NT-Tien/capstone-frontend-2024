export async function mockMutation<T>(mutationFn: () => T, delay: number = 1000): Promise<T> {
   return new Promise((resolve) => {
      setTimeout(() => {
         resolve(mutationFn())
      }, delay)
   })
}
