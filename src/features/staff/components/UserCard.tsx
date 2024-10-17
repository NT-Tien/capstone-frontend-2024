import { Avatar, Card, Tag } from "antd"
import { UserOutlined } from "@ant-design/icons"
import { UserDto } from "@/lib/domain/User/User.dto"

type Props = {
   className?: string
   user?: UserDto
}

function UserCard(props: Props) {
   return (
      <Card
         loading={props.user === undefined}
         classNames={{
            body: "flex",
         }}
         className={props.className}
         size="small"
      >
         <Avatar size={52} icon={<UserOutlined />} className="mr-3" />
         <div className="flex flex-grow flex-col justify-center">
            <div className="text-base font-bold">{props.user?.username}</div>
            <div className="text-sm">{props.user?.phone ?? "+84123456789"}</div>
         </div>
         <div className="flex flex-col justify-center">
            <Tag>{props.user?.role ?? "Trưởng phòng"}</Tag>
         </div>
      </Card>
   )
}

export default UserCard
