const colors = [
   "bg-blue-500",
   "bg-green-500",
   "bg-yellow-500",
   "bg-red-500",
   "bg-purple-500",
   "bg-pink-500",
   "bg-indigo-500",
   "bg-cyan-500",
]

function generateAvatarData(input: string) {
   let content
   const splitInput = input.split(" ")
   if (splitInput.length > 1) {
      content = splitInput[0][0] + splitInput[1][0]
   } else {
      content = splitInput[0][0] + (splitInput[0][1] ? splitInput[0][1] : "")
   }
   const color =
      colors[
         content
            .split("")
            .map((char) => char.charCodeAt(0))
            .reduce((acc, cur) => acc + cur, 0) % colors.length
      ]

   return {
      content,
      color,
   }
}

export default generateAvatarData
