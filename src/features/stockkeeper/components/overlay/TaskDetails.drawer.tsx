import React from "react";
import { Drawer, Descriptions, Tag } from "antd";
import { TaskDto } from "@/lib/domain/Task/Task.dto";
import { TaskStatusTagMapper } from "@/lib/domain/Task/TaskStatus.enum";
import dayjs from "dayjs";

interface TaskDetailsDrawerProps {
  visible: boolean;
  onClose: () => void;
  task: TaskDto | null;
}

const TaskDetailsDrawer: React.FC<TaskDetailsDrawerProps> = ({ visible, onClose, task }) => {
  if (!task) return null; 

  return (
    <Drawer
      title="Chi tiết tác vụ"
      placement="right"
      width={400}
      onClose={onClose}
      visible={visible}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Tên">{task.name}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={TaskStatusTagMapper[task.status].colorInverse}>
            {TaskStatusTagMapper[task.status].text}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Người sửa">{task.fixer?.username ?? "-"}</Descriptions.Item>
        <Descriptions.Item label="Ngày sửa">{task.fixerDate ? dayjs(task.fixerDate).format("DD/MM/YYYY") : "-"}</Descriptions.Item>
        <Descriptions.Item label="Mức độ ưu tiên">{task.priority ? "Ưu tiên" : "Bình thường"}</Descriptions.Item>
        {/* <Descriptions.Item label="Linh kiện">{task.confirmReceipt ? "Đã lấy" : "Chưa lấy"}</Descriptions.Item> */}
        <Descriptions.Item label="Mẫu máy">{task.device.machineModel.name ?? "-"}</Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default TaskDetailsDrawer;
