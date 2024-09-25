export class UnauthorizedError extends Error {
   constructor(message?: string) {
      super("You're not allowed to access this function.")
      this.name = "UnauthorizedError"
   }
}
