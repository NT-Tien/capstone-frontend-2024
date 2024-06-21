import { createContext } from "react"
import { StartContextType } from "@/app/head-staff/(stack)/reports/[id]/(start-report)/_types/StartContextType"

const StartContext = createContext<StartContextType | undefined>(undefined)

export default StartContext
