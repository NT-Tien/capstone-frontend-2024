"use client"

import { createContext, PropsWithChildren, SetStateAction, useContext, useState } from "react"

const MyContext = createContext({
   value: 1,
   setValue: (value: SetStateAction<number>) => {},
})

export function ComponentProvider(props: PropsWithChildren) {
   const [value, setValue] = useState<number>(1)

   return <MyContext.Provider value={{ value, setValue }}>{props.children}</MyContext.Provider>
}

ComponentProvider.use = () => {
   // eslint-disable-next-line react-hooks/rules-of-hooks
   const context = useContext(MyContext)

   if (!context) {
      throw new Error("useContext must be used within a ComponentProvider")
   }

   return context
}
