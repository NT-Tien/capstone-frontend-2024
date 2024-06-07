export async function mockQuery<T>(responseData: T, delay: number = 1000): Promise<T> {
   return new Promise((resolve) => {
      setTimeout(() => {
         resolve(responseData)
      }, delay)
   })
}
