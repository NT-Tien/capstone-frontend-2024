"use client"

import { UseQueryResult } from "@tanstack/react-query"
import { FixRequestDto } from "@/common/dto/FixRequest.dto"

type Props = {
   api: UseQueryResult<FixRequestDto, Error>
}

export default function TasksList(props: Props) {
   return "Tasks"
}
