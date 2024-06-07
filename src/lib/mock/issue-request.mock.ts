import { IssueRequestDto } from "@/common/dto/IssueRequest.dto"
import { UserMock } from "@/lib/mock/user.mock"
import { DeviceMock } from "@/lib/mock/device.mock"
import dayjs from "dayjs"

const getRandomDate = () => {
   const start = new Date(2024, 0, 1)
   const end = new Date()
   const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
   return date.toISOString()
}

export let IssueRequestMock: IssueRequestDto[] = [
   {
      id: "1",
      createdAt: getRandomDate(),
      updatedAt: getRandomDate(),
      deletedAt: null,
      description: "The machine is not working",
      status: "PENDING",
      device: DeviceMock[0],
      account: UserMock[2],
   },
   {
      id: "2",
      createdAt: getRandomDate(),
      updatedAt: getRandomDate(),
      deletedAt: null,
      description: "Won't start",
      status: "PENDING",
      device: DeviceMock[1],
      account: UserMock[1],
   },
   {
      id: "3",
      createdAt: getRandomDate(),
      updatedAt: getRandomDate(),
      deletedAt: null,
      description: "Buttons not working",
      status: "PENDING",
      device: DeviceMock[2],
      account: UserMock[0],
   },
   {
      id: "4",
      createdAt: getRandomDate(),
      updatedAt: getRandomDate(),
      deletedAt: null,
      description: "Screen is flickering",
      status: "PENDING",
      device: DeviceMock[3],
      account: UserMock[3],
   },
   {
      id: "5",
      createdAt: getRandomDate(),
      updatedAt: getRandomDate(),
      deletedAt: null,
      description: "No sound",
      status: "PENDING",
      device: DeviceMock[4],
      account: UserMock[4],
   },
   {
      id: "6",
      createdAt: getRandomDate(),
      updatedAt: getRandomDate(),
      deletedAt: null,
      description: "Overheating issue",
      status: "PENDING",
      device: DeviceMock[5],
      account: UserMock[5],
   },
   {
      id: "7",
      createdAt: getRandomDate(),
      updatedAt: getRandomDate(),
      deletedAt: null,
      description: "Connection problem",
      status: "PENDING",
      device: DeviceMock[6],
      account: UserMock[6],
   },
   {
      id: "8",
      createdAt: dayjs().subtract(2, "day").toISOString(),
      updatedAt: dayjs().subtract(2, "day").toISOString(),
      deletedAt: null,
      description: "Battery not charging",
      status: "PENDING",
      device: DeviceMock[7],
      account: UserMock[7],
   },
   {
      id: "9",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      description: "Error code 404",
      status: "PENDING",
      device: DeviceMock[8],
      account: UserMock[8],
   },
   {
      id: "10",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      description: "Power button stuck",
      status: "PENDING",
      device: DeviceMock[4],
      account: UserMock[4],
   },
]

export function setIssueRequestMock(mock: IssueRequestDto[]) {
   IssueRequestMock = mock
}
