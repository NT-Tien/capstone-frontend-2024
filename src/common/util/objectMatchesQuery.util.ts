export function objectMatchesQuery<T extends Record<string, unknown>, U extends Record<string, unknown>>(
   object: T,
   query: Partial<U>,
): boolean {
   for (const [key, value] of Object.entries(query)) {
      if (object[key] !== value) {
         return false
      }
   }

   return true
}
