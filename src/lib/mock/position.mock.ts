import { PositionDto } from "@/common/dto/Position.dto"
import { AreaMock } from "@/lib/mock/area.mock"

export let PositionMock: PositionDto[] = [
   // Positions for Area 61
   {
      id: "379103af-8c2a-4f6e-808c-a6d954f49eb0",
      createdAt: "2024-06-06T07:11:51.684Z",
      updatedAt: "2024-06-06T07:11:51.684Z",
      deletedAt: null,
      positionX: 0,
      positionY: 0,
      area: AreaMock[0],
   },
   {
      id: "489214bf-9d3b-5g7f-919d-b7e165f50fc1",
      createdAt: "2024-06-06T07:12:51.684Z",
      updatedAt: "2024-06-06T07:12:51.684Z",
      deletedAt: null,
      positionX: 10,
      positionY: 10,
      area: AreaMock[0],
   },
   {
      id: "59a325cf-ae4c-6h8g-921e-c8f276g61gd2",
      createdAt: "2024-06-06T07:13:51.684Z",
      updatedAt: "2024-06-06T07:13:51.684Z",
      deletedAt: null,
      positionX: 20,
      positionY: 20,
      area: AreaMock[0],
   },
   // Positions for Area 62
   {
      id: "6ab436df-bf5d-7i9h-032f-d9g387h72he3",
      createdAt: "2024-06-06T07:14:51.684Z",
      updatedAt: "2024-06-06T07:14:51.684Z",
      deletedAt: null,
      positionX: 30,
      positionY: 30,
      area: AreaMock[1],
   },
   {
      id: "7bc547ef-dg6e-8j0i-143g-e0h498i83if4",
      createdAt: "2024-06-06T07:15:51.684Z",
      updatedAt: "2024-06-06T07:15:51.684Z",
      deletedAt: null,
      positionX: 40,
      positionY: 40,
      area: AreaMock[1],
   },
   {
      id: "8cd658ff-eh7f-9k1j-254h-f1i509j94jg5",
      createdAt: "2024-06-06T07:16:51.684Z",
      updatedAt: "2024-06-06T07:16:51.684Z",
      deletedAt: null,
      positionX: 50,
      positionY: 50,
      area: AreaMock[1],
   },
   // Positions for Area 63
   {
      id: "9de7690f-fi8g-0l2k-365i-g2j610k05kh6",
      createdAt: "2024-06-06T07:17:51.684Z",
      updatedAt: "2024-06-06T07:17:51.684Z",
      deletedAt: null,
      positionX: 60,
      positionY: 60,
      area: AreaMock[2],
   },
   {
      id: "afg87a1f-gj9h-1m3l-476j-h3k721l16li7",
      createdAt: "2024-06-06T07:18:51.684Z",
      updatedAt: "2024-06-06T07:18:51.684Z",
      deletedAt: null,
      positionX: 70,
      positionY: 70,
      area: AreaMock[2],
   },
   {
      id: "bgh98b2f-hk0i-2n4m-587k-i4l832m27mj8",
      createdAt: "2024-06-06T07:19:51.684Z",
      updatedAt: "2024-06-06T07:19:51.684Z",
      deletedAt: null,
      positionX: 80,
      positionY: 80,
      area: AreaMock[2],
   },
   // Positions for Area 64
   {
      id: "chi19c3f-il1j-3o5n-698l-j5m943n38nk9",
      createdAt: "2024-06-06T07:20:51.684Z",
      updatedAt: "2024-06-06T07:20:51.684Z",
      deletedAt: null,
      positionX: 90,
      positionY: 90,
      area: AreaMock[3],
   },
   {
      id: "dij20d4f-jm2k-4p6o-709m-k6n054o49olo",
      createdAt: "2024-06-06T07:21:51.684Z",
      updatedAt: "2024-06-06T07:21:51.684Z",
      deletedAt: null,
      positionX: 100,
      positionY: 100,
      area: AreaMock[3],
   },
   {
      id: "ejk31e5f-kn3l-5q7p-810n-l7o165p50pmq",
      createdAt: "2024-06-06T07:22:51.684Z",
      updatedAt: "2024-06-06T07:22:51.684Z",
      deletedAt: null,
      positionX: 110,
      positionY: 110,
      area: AreaMock[3],
   },
   // Positions for Area 65
   {
      id: "fkl42f6f-lo4m-6r8q-921o-m8p276q61qnr",
      createdAt: "2024-06-06T07:23:51.684Z",
      updatedAt: "2024-06-06T07:23:51.684Z",
      deletedAt: null,
      positionX: 120,
      positionY: 120,
      area: AreaMock[4],
   },
   {
      id: "glm53g7f-mp5n-7s9r-032p-n9q387r72ros",
      createdAt: "2024-06-06T07:24:51.684Z",
      updatedAt: "2024-06-06T07:24:51.684Z",
      deletedAt: null,
      positionX: 130,
      positionY: 130,
      area: AreaMock[4],
   },
   {
      id: "hmn64h8f-nq6o-8t0s-143q-o0r498s83stu",
      createdAt: "2024-06-06T07:25:51.684Z",
      updatedAt: "2024-06-06T07:25:51.684Z",
      deletedAt: null,
      positionX: 140,
      positionY: 140,
      area: AreaMock[4],
   },
]

export function setPositionMock(mock: PositionDto[]) {
   PositionMock = mock
}
