export function capitalizeFirstLetter(str: string) {
   const parts = str.split(" ")
   return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")
}
