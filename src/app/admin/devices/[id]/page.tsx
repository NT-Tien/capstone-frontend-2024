"use client"

import { useParams } from "next/navigation"

export default function DeviceDetails() {
   const params = useParams()
   return `One device ${params.id}`
}
