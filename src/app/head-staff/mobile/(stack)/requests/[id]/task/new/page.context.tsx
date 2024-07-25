import { ButtonProps } from "antd"
import { createContext, Dispatch, SetStateAction, useContext } from "react"

type PageContextType = {
   setNextBtnProps: Dispatch<SetStateAction<ButtonProps>>
   setPrevBtnProps: Dispatch<SetStateAction<ButtonProps>>
   setStep: Dispatch<SetStateAction<number>>
}

export const PageContext = createContext<PageContextType | undefined>(undefined)

export function usePageContext() {
   const context = useContext(PageContext)
   if (context === undefined) {
      throw new Error("usePageContext must be used within a PageContext")
   }
   return context
}
