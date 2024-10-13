import { PropsWithChildren } from "react"
import { SimulationStoreProvider } from "@/app/simulation/(layout)/main-flow/store-provider"

function Layout(props: PropsWithChildren) {
   return <SimulationStoreProvider>{props.children}</SimulationStoreProvider>
}

export default Layout
