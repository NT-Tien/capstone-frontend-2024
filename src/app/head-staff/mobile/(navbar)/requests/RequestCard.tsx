import { Avatar, Button } from "antd"
import { MoreOutlined } from "@ant-design/icons"

function RequestCard() {
   return (
      <div className="flex flex-col">
         <div className="flex">
            <Avatar size={64} src="Text" />
            <div className="flex flex-grow flex-col">
               <div>Name</div>
               <div>Text | Text</div>
            </div>
            <Button type="text" size="large" icon={<MoreOutlined />} />
         </div>
         <div>Description</div>
         <div className="flex">
            <div className="flex-grow">50% complete</div>
            <div>Text</div>
         </div>
      </div>
   )
}

export default RequestCard
