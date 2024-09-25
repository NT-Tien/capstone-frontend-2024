import { ComponentProvider } from "@/app/test/Component"
import Inner from "./Client"

function Page() {
   return (
      <ComponentProvider>
         <Inner />
      </ComponentProvider>
   )
}

export default Page
