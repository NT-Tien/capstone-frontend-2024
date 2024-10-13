"use client"

import createSimulationStore, { SimulationStore } from "@/app/simulation/(layout)/main-flow/store"
import { createContext, PropsWithChildren, useContext, useRef } from "react"
import { useStore } from "zustand"

type SimulationStoreApi = ReturnType<typeof createSimulationStore>
const SimulationStoreContext = createContext<SimulationStoreApi | undefined>(undefined)

function SimulationStoreProvider(props: PropsWithChildren) {
   const storeRef = useRef<SimulationStoreApi>()

   if (!storeRef.current) {
      storeRef.current = createSimulationStore()
   }

   return <SimulationStoreContext.Provider value={storeRef.current} {...props} />
}

function useSimulationStore<T>(selector: (store: SimulationStore) => T): T {
   const store = useContext(SimulationStoreContext)

   if (!store) {
      throw new Error("useSimulationStore must be used within a SimulationStoreProvider")
   }

   return useStore(store, selector)
}

export { SimulationStoreProvider, useSimulationStore, SimulationStoreContext }
export type { SimulationStoreApi }
