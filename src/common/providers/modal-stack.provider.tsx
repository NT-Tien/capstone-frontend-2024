import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"

type ModalStackContextType = {
   stack: (() => any)[]
   popStack: () => void
   pushStack: (handleClose: () => any) => void
}

const ModalStackContext = createContext<undefined | ModalStackContextType>(undefined)

export default function ModalStackProvider({ children }: { children: ReactNode }) {
   const [stack, setStack] = useState<(() => any)[]>([])

   const popStack = useCallback(() => {
      console.log("POP", stack)
      if (stack.length < 1) return // no more modals to close

      const current = stack.pop() // get the last modal close function
      current?.() // run the close function

      console.log("POPPED", stack)
      window.history.replaceState(null, "", document.URL) // remove history entry
      setStack([...stack])
   }, [stack])

   const pushStack = useCallback(
      (handleClose: () => any) => {
         console.log("PUSHED", [...stack, handleClose])

         // add history entry
         window.history.pushState(null, "", document.URL)

         // push close function to stack
         setStack((prev) => [...prev, handleClose])
      },
      [stack],
   )

   useEffect(() => {
      window.addEventListener("popstate", popStack)
      return () => {
         window.removeEventListener("popstate", popStack)
      }
   }, [popStack])

   return <ModalStackContext.Provider value={{ stack, popStack, pushStack }}>{children}</ModalStackContext.Provider>
}

export function useModalStack() {
   const context = useContext(ModalStackContext)

   if (!context) {
      throw new Error("useModalStack must be used within a ModalStackProvider")
   }

   return context
}
