function deepEquals<T>(obj1: T, obj2: T): boolean {
   // if either input is a primitive
   if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
      return obj1 === obj2
   }

   // if both inputs are objects
   const keys1 = Object.keys(obj1) as (keyof T)[]
   const keys2 = Object.keys(obj2) as (keyof T)[]

   if (keys1.length !== keys2.length) {
      return false
   }

   for (let key of keys1) {
      if (!obj2.hasOwnProperty(key) || !deepEquals(obj1[key], obj2[key])) {
         return false
      }
   }

   return true
}

export default deepEquals
