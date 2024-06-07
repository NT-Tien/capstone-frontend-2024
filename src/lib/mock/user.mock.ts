import { UserDto } from "@/common/dto/User.dto"
import { Role } from "@/common/enum/role.enum"

export let UserMock: UserDto[] = [
   {
      id: "17c2d3f5-2e21-4b62-8d54-31bad931d6a2",
      createdAt: "2024-06-01 08:46:41.239650",
      updatedAt: "2024-06-01 08:46:41.239650",
      deletedAt: null,
      username: "tiennt",
      phone: "+84559330072",
      role: Role.admin,
   },
   {
      id: "ae012780-9b69-4e62-b84b-f344babbda5b",
      createdAt: "2024-06-03 07:19:35.698599",
      updatedAt: "2024-06-03 07:19:35.698599",
      deletedAt: null,
      username: "head",
      phone: "+84919127526",
      role: Role.head,
   },
   {
      id: "238f8d29-d35f-43ff-8305-6619237545f1",
      createdAt: "2024-06-03 07:18:51.890567",
      updatedAt: "2024-06-03 07:18:51.890567",
      deletedAt: null,
      username: "stockkeeper",
      phone: "+84919127526",
      role: Role.stockkeeper,
   },
   {
      id: "0f778d33-a746-4dcf-acac-458d5dd11416",
      createdAt: "2024-06-03 07:19:26.574316",
      updatedAt: "2024-06-03 07:19:26.574316",
      deletedAt: null,
      username: "headstaff",
      phone: "+84919127526",
      role: Role.headstaff,
   },
   {
      id: "4cdc3099-203e-45f5-ae4d-78e03747fa1e",
      createdAt: "2024-06-03 07:18:48.314601",
      updatedAt: "2024-06-03 07:18:48.314601",
      deletedAt: null,
      username: "admin",
      phone: "+84919127526",
      role: Role.admin,
   },
   {
      id: "a08644eb-ab48-449c-867f-17ccd010cada",
      createdAt: "2024-06-03 07:18:54.650652",
      updatedAt: "2024-06-03 07:18:54.650652",
      deletedAt: null,
      username: "staff",
      phone: "+84919127526",
      role: Role.staff,
   },
   {
      id: "824b1297-5b09-4801-a74d-6b8ee1bbcdd7",
      createdAt: "2024-06-03 07:19:30.557356",
      updatedAt: "2024-06-03 07:19:30.557356",
      deletedAt: null,
      username: "manager",
      phone: "+84919127526",
      role: Role.manager,
   },
   {
      id: "294524d9-46fe-4b0a-959d-4e4542f34cba",
      createdAt: "2024-06-03 19:43:23.693779",
      updatedAt: "2024-06-03 19:43:23.693779",
      deletedAt: null,
      username: "sang",
      phone: "+84919127526",
      role: null,
   },
   {
      id: "d8432d75-a260-4497-9ccb-e25424ed1c60",
      createdAt: "2024-06-03 19:44:13.866650",
      updatedAt: "2024-06-03 19:44:13.866650",
      deletedAt: null,
      username: "sang1",
      phone: "+84919127526",
      role: null,
   },
]

export function setUserMock(mock: UserDto[]) {
   UserMock = mock
}
