import { EnvError } from "@/common/error/env.error"

class ClientEnv {
   public readonly BACKEND_URL: string
   public readonly NODE_ENV

   constructor() {
      if (process.env.NEXT_PUBLIC_BACKEND_URL) {
         this.BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
      } else {
         throw new EnvError("NEXT_PUBLIC_BACKEND_URL", "missing")
      }
      
      this.NODE_ENV = process.env.NODE_ENV
   }
}

export const clientEnv = new ClientEnv()
