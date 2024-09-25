export class EnvError extends Error {
   constructor(content: string, type?: "missing") {
      if (type === "missing") {
         super(`Environment variable ${content} is missing`)
      }

      super(content)
      this.name = "EnvError"
   }
}
