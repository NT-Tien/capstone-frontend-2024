import { createStore } from "zustand"

type SimulationState = {
   counts_fixRequests: number
   counts_warrantyRequests: number
   idLists_fixRequest: string[]
   idLists_warrantyRequest: string[]
   hasApproved_warranyRequest: boolean
}
type SimulationActions = {
   update_counts_fixRequests: (counts_fixRequests: number | null | undefined) => void
   update_counts_warrantyRequests: (counts_warrantyRequests: number | null | undefined) => void
   update_counts_reset: () => void
   update_idLists_fixRequest: (idLists_fixRequest: string[]) => void
   update_idLists_warrantyRequest: (idLists_warrantyRequest: string[]) => void

   set_hasApproved_warranyRequest: (hasApproved_warranyRequest: boolean) => void
}
type SimulationStore = SimulationActions & SimulationState

const defaultInitState: SimulationState = {
   counts_fixRequests: 0,
   counts_warrantyRequests: 0,
   idLists_fixRequest: [],
   idLists_warrantyRequest: [],
   hasApproved_warranyRequest: false,
}

function createSimulationStore(initState: SimulationState = defaultInitState) {
   return createStore<SimulationStore>()((set) => ({
      ...initState,
      update_counts_fixRequests: (counts_fixRequests) => set({ counts_fixRequests: counts_fixRequests ?? 0 }),
      update_counts_warrantyRequests: (counts_warrantyRequests) =>
         set({ counts_warrantyRequests: counts_warrantyRequests ?? 0 }),
      update_counts_reset: () => set({ counts_fixRequests: 0, counts_warrantyRequests: 0 }),
      update_idLists_fixRequest: (idLists_fixRequest) => set({ idLists_fixRequest }),
      update_idLists_warrantyRequest: (idLists_warrantyRequest) => set({ idLists_warrantyRequest }),
      set_hasApproved_warranyRequest: (hasApproved_warranyRequest) => set({ hasApproved_warranyRequest }),
   }))
}

export default createSimulationStore
export type { SimulationStore, SimulationState, SimulationActions }
export { defaultInitState }
