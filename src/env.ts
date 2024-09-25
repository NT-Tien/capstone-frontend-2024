"use client"

import { EnvError } from "@/lib/error/env.error"

class ClientEnv {
   private _BACKEND_URL: string
   public readonly NODE_ENV

   constructor() {
      if (process.env.NEXT_PUBLIC_BACKEND_URL) {
         this._BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
      } else {
         throw new EnvError("NEXT_PUBLIC_BACKEND_URL", "missing")
      }

      this.NODE_ENV = process.env.NODE_ENV
   }

   get BACKEND_URL(): string {
      return this._BACKEND_URL
   }

   set BACKEND_URL(value: string) {
      this._BACKEND_URL = value
   }
}

export const clientEnv = new ClientEnv()
