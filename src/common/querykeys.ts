import { UserDto } from "@/common/dto/User.dto"

const qk = {
   users: {
      all: () => ["users"],
      byId: (id: number) => ["users", id],
   },
   areas: {
      all: () => ["areas"],
   },
   positions: {
      all: () => ["positions"],
   },
}

export default qk
