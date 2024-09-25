export class NotFoundError extends Error {
   constructor(targetObject: string) {
      super(`${targetObject} not found`)
      this.name = "NotFoundError"
   }
}
