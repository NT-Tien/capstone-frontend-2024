"use client"

import { useParams } from "next/navigation"

export default function () {
   const params = useParams()
   return `One area ${params.id}`
}
