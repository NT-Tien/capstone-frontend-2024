import { IssueRequestDto } from "@/common/dto/IssueRequest.dto"
import { UserMock } from "@/lib/mock/user.mock"
import { DeviceMock } from "@/lib/mock/device.mock"
import dayjs from "dayjs"
import { IssueRequestStatus } from "@/common/enum/issue-request-status.enum"

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
      requester_note: "The machine is not working",
      status: IssueRequestStatus.PENDING,
      device: DeviceMock[0],
      requester: UserMock[2],
   },
   {
      id: "2",
      createdAt: getRandomDate(),
      updatedAt: getRandomDate(),
      deletedAt: null,
      requester_note: "Won't start",
      status: IssueRequestStatus.APPROVED,
      device: DeviceMock[1],
      requester: UserMock[1],
   },
   {
      id: "3",
      createdAt: getRandomDate(),
      updatedAt: getRandomDate(),
      deletedAt: null,
      requester_note: "Buttons not working",
      status: IssueRequestStatus.REJECTED,
      device: DeviceMock[2],
      requester: UserMock[0],
   },
   {
      id: "4",
      createdAt: getRandomDate(),
      updatedAt: getRandomDate(),
      deletedAt: null,
      requester_note: "Screen is flickering",
      status: IssueRequestStatus.APPROVED,
      device: DeviceMock[3],
      requester: UserMock[3],
   },
   {
      id: "5",
      createdAt: getRandomDate(),
      updatedAt: getRandomDate(),
      deletedAt: null,
      requester_note: "No sound",
      status: IssueRequestStatus.PENDING,
      device: DeviceMock[4],
      requester: UserMock[4],
   },
   {
      id: "6",
      createdAt: getRandomDate(),
      updatedAt: getRandomDate(),
      deletedAt: null,
      requester_note: "Overheating issue",
      status: IssueRequestStatus.PENDING,
      device: DeviceMock[5],
      requester: UserMock[5],
   },
   {
      id: "7",
      createdAt: getRandomDate(),
      updatedAt: getRandomDate(),
      deletedAt: null,
      requester_note: "Connection problem",
      status: IssueRequestStatus.PENDING,
      device: DeviceMock[6],
      requester: UserMock[6],
   },
   {
      id: "8",
      createdAt: dayjs().subtract(2, "day").toISOString(),
      updatedAt: dayjs().subtract(2, "day").toISOString(),
      deletedAt: null,
      requester_note: "Battery not charging",
      status: IssueRequestStatus.APPROVED,
      device: DeviceMock[7],
      requester: UserMock[7],
   },
   {
      id: "9",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      requester_note: "Error code 404",
      status: IssueRequestStatus.REJECTED,
      device: DeviceMock[8],
      requester: UserMock[8],
   },
   {
      id: "10",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      requester_note: "Power button stuck",
      status: IssueRequestStatus.PENDING,
      device: DeviceMock[4],
      requester: UserMock[4],
   },
]

export function setIssueRequestMock(mock: IssueRequestDto[]) {
   IssueRequestMock = mock
}
