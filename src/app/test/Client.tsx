"use client"

import { ComponentProvider } from "@/app/test/Component"

function Inner() {
   const ctx = ComponentProvider.use()
   return (
      <div>
         <button onClick={() => ctx.setValue((prev) => prev + 1)}>Add</button>
         {ctx.value}
      </div>
   )
}

export default Inner
