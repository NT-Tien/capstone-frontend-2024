function uuidNormalizer(original: string) {
   let value = original.replace(/-/g, "").trim()
   if (value.length > 8) {
      value = `${value.slice(0, 8)}-${value.slice(8)}`
   }
   if (value.length > 13) {
      value = `${value.slice(0, 13)}-${value.slice(13)}`
   }
   if (value.length > 18) {
      value = `${value.slice(0, 18)}-${value.slice(18)}`
   }
   if (value.length > 23) {
      value = `${value.slice(0, 23)}-${value.slice(23)}`
   }
   if (value.length > 36) {
      value = value.slice(0, 36)
   }
   return value
}

export default uuidNormalizer
