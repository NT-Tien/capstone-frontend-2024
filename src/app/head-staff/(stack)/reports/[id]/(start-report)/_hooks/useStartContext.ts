"use client"

import { useContext } from "react"
import StartContext from "@/app/head-staff/(stack)/reports/[id]/(start-report)/_context/StartContext"

export default function useStartContext() {
   const context = useContext(StartContext)

   if (!context) {
      throw new Error("You must use this hook in a Start _context provider")
   }

   return context
}
