"use client"

import { createContext, ReactNode, useContext, useState } from "react"

type CreateTaskContextType = {
   requestId: string | undefined
   issueIds: string[]
   clear: () => void
   add: (requestId: string, issueIds?: string[]) => void
}

export const CreateTaskContext = createContext<CreateTaskContextType | undefined>(undefined)
export default function CreateTaskContextProvider({ children }: { children: ReactNode }) {
   const [requestId, setRequestId] = useState<string | undefined>(undefined)
   const [issueIds, setIssueIds] = useState<string[]>([])

   function clear() {
      setRequestId(undefined)
      setIssueIds([])
   }

   function add(requestId: string, issueIds?: string[]) {
      setRequestId(requestId)
      setIssueIds(issueIds ?? [])
   }

   return (
      <CreateTaskContext.Provider value={{ requestId, issueIds, clear, add }}>{children}</CreateTaskContext.Provider>
   )
}

export function useCreateTask() {
   const context = useContext(CreateTaskContext)
   if (!context) {
      throw new Error("useCreateTask must be used within a CreateTaskContextProvider")
   }
   return context
}
