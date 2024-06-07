import { AreaDto } from "@/common/dto/Area.dto"

export let AreaMock: AreaDto[] = [
   {
      id: "b17831a2-b513-4c51-b910-e88a01a3ebef",
      createdAt: "2024-06-06T07:11:37.309Z",
      updatedAt: "2024-06-06T07:11:37.309Z",
      deletedAt: null,
      name: "Area 61",
      instruction: "nan",
      width: 100,
      height: 100,
   },
   {
      id: "c28942b3-c624-4d62-c920-f99a12b4fcde",
      createdAt: "2024-06-05T08:20:37.309Z",
      updatedAt: "2024-06-05T08:20:37.309Z",
      deletedAt: null,
      name: "Area 62",
      instruction: "Keep Clear",
      width: 200,
      height: 150,
   },
   {
      id: "d39053c4-d735-4e73-d930-0a0b23c5gdef",
      createdAt: "2024-06-04T09:30:37.309Z",
      updatedAt: "2024-06-04T09:30:37.309Z",
      deletedAt: null,
      name: "Area 63",
      instruction: "Restricted Access",
      width: 150,
      height: 200,
   },
   {
      id: "e4a064d5-e846-4f84-e940-1b1c34d6hghi",
      createdAt: "2024-06-03T10:40:37.309Z",
      updatedAt: "2024-06-03T10:40:37.309Z",
      deletedAt: null,
      name: "Area 64",
      instruction: "Authorized Personnel Only",
      width: 300,
      height: 300,
   },
   {
      id: "f5b175e6-f957-5085-fa50-2c2d45e7ijjk",
      createdAt: "2024-06-02T11:50:37.309Z",
      updatedAt: "2024-06-02T11:50:37.309Z",
      deletedAt: null,
      name: "Area 65",
      instruction: "Wear Safety Gear",
      width: 250,
      height: 250,
   },
]

export function setAreaMock(mock: AreaDto[]) {
   AreaMock = mock
}
