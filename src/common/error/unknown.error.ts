export class UnknownError extends Error {
   constructor(details: any) {
      super("An unknown error occurred. Details: " + JSON.stringify(details, null, 2))
      this.name = "UnknownError"
   }
}
