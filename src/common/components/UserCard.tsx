import { Avatar, Card, Tag } from "antd"
import { UserOutlined } from "@ant-design/icons"
import { JwtToken } from "@/common/types/JwtToken"

type Props = {
   jwt: JwtToken
   className?: string
}

export default function UserCard(props: Props) {
   return (
      <Card
         classNames={{
            body: "flex",
         }}
         className={props.className}
         size="small"
      >
         <Avatar size={52} icon={<UserOutlined />} className="mr-3" />
         <div className="flex flex-grow flex-col">
            <div className="text-xl font-bold">{props.jwt.role}</div>
            <div>{props.jwt.phone}</div>
         </div>
         <div className="flex flex-col justify-center">
            <Tag>{props.jwt.role}</Tag>
         </div>
      </Card>
   )
}
