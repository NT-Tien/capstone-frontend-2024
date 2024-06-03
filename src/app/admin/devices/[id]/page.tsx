"use client"

import { useParams } from "next/navigation"

export default function () {
   const params = useParams()
   return `One device ${params.id}`
}
