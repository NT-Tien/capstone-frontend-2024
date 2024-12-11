import { cn } from "@/lib/utils/cn.util"

type Props = {
   items: {
      name: string
      status: "complete" | "current" | "upcoming"
      onClick: () => void
   }[]
   className?: string
}

export default function Steps(props: Props) {
   return (
      <nav className={cn("flex items-center justify-center", props.className)} aria-label="Progress">
         <p className="text-sm font-medium">
            Trang {props.items.findIndex((step) => step.status === "current") + 1}/{props.items.length}
         </p>
         <ol role="list" className="ml-3 flex items-center space-x-2">
            {props.items.map((step) => (
               <li key={step.name}>
                  {step.status === "complete" ? (
                     <a
                        className="block h-1.5 w-1.5 rounded-full bg-orange-600 hover:bg-orange-900"
                        onClick={step.onClick}
                     >
                        <span className="sr-only">{step.name}</span>
                     </a>
                  ) : step.status === "current" ? (
                     <a
                        className="relative flex items-center justify-center"
                        aria-current="step"
                        onClick={step.onClick}
                     >
                        <span className="absolute flex h-5 w-5 p-px" aria-hidden="true">
                           <span className="h-full w-full rounded-full bg-orange-200" />
                        </span>
                        <span className="relative block h-2.5 w-2.5 rounded-full bg-orange-600" aria-hidden="true" />
                        <span className="sr-only">{step.name}</span>
                     </a>
                  ) : (
                     <a onClick={step.onClick} className="block h-2.5 w-2.5 rounded-full bg-gray-200 hover:bg-gray-400">
                        <span className="sr-only">{step.name}</span>
                     </a>
                  )}
               </li>
            ))}
         </ol>
      </nav>
   )
}
