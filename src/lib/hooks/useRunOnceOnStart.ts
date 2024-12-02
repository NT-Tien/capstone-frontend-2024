"use client"

import { useRef } from "react"

function useRunOnceOnStart(fn: () => void) {
   const hasRun = useRef(false)
   if (!hasRun.current) {
      hasRun.current = true
      fn()
      return true
   }
   return false
}

export default useRunOnceOnStart
