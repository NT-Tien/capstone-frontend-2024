import React from "react";

type StatusCardProps = {
  title: string;
  stages: { label: string; color: string }[];
};

const StatusCard: React.FC<StatusCardProps> = ({ title, stages }) => {
  return (
    <div className="border rounded-lg p-4 shadow-md bg-white">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex space-x-2 items-center">
        {stages.map((stage, index) => (
          <div
            key={index}
            className={`flex items-center justify-center w-16 h-16 rounded-lg text-white ${stage.color}`}
          >
            <span>{stage.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusCard;