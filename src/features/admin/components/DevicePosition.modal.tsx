import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, message } from "antd";
import admin_queries from "../queries";

type DevicePositionModalProps = {
   visible: boolean;
   onClose: () => void;
   onSelectPosition: (x: number, y: number) => void;
   areaId?: string;
   width?: number;
   height?: number;
};

type QueryState = {
   page: number;
   limit: number;
   search: {
      positionX?: string;
      positionY?: string;
      area?: string;
      description?: string;
   };
   sort: {
      order?: "ASC" | "DESC";
      orderBy?: string;
   };
};

const DevicePositionModal: React.FC<DevicePositionModalProps> = ({
   visible,
   onClose,
   onSelectPosition,
   areaId,
   width = 10,
   height = 10
}) => {
   const [occupiedPositions, setOccupiedPositions] = useState<Set<string>>(new Set());
   const [query, setQuery] = useState<QueryState>({
    page: 1,
    limit: 10,
    sort: {
       order: "ASC",
       orderBy: "position",
    },
    search: {},
 })
   const queryProps = useMemo(() => ({
      page: 1,
      limit: 100,
      sort: {
         order: "ASC",
         orderBy: "position",
      },
      search: {
         area: areaId,
         positionX: undefined,
         positionY: undefined,
         description: undefined,
      },
   }), [areaId]);

   const api_devices = admin_queries.device.all_filterAndSort({
    page: query.page,
    limit: query.limit,
    filters: {
       positionX: Number(query.search?.positionX),
       positionY: Number(query.search?.positionY),
       area: query.search?.area,
       description: query.search?.description,
    },
    sort: {
       order: query.sort?.order,
       orderBy: query.sort?.orderBy as any,
    },
 })
   useEffect(() => {
      if (visible && api_devices.data) {
         const positions = new Set(
            api_devices.data.list
               .filter(device => device.positionX != null && device.positionY != null)
               .map(device => `${device.positionX},${device.positionY}`)
         );
         setOccupiedPositions(positions);
      } else {
         setOccupiedPositions(new Set());
      }
   }, [visible, api_devices.data]);

   const renderCells = () => {
      const cells = [];
      if (width && height) {
         for (let y = 1; y <= height; y++) {
            for (let x = 1; x <= width; x++) {
               const positionKey = `${x},${y}`;
               const isOccupied = occupiedPositions.has(positionKey);
               cells.push(
                  <Button
                     key={positionKey}
                     style={{
                        margin: 2,
                        width: 50,
                        height: 50,
                        backgroundColor: isOccupied ? "#f0f0f0" : "#fff",
                        color: isOccupied ? "#999" : "#000",
                        cursor: isOccupied ? "not-allowed" : "pointer",
                     }}
                     onClick={() => {
                        if (!isOccupied) {
                           onSelectPosition(x, y);
                           onClose();
                        } else {
                           message.info(`Vị trí (${x}, ${y}) đã được sử dụng.`);
                        }
                     }}
                     disabled={isOccupied}
                  >
                     {x}x{y}
                  </Button>
               );
            }
         }
      }
      return cells;
   };

   return (
      <Modal 
         title="Chọn vị trí thiết bị" 
         visible={visible} 
         onCancel={onClose} 
         footer={null} 
         width={Math.min(width * 55, 800)}
      >
         <div
            style={{
               display: "grid",
               gridTemplateColumns: `repeat(${width}, 1fr)`,
               gap: "4px",
               justifyItems: "center",
               alignItems: "center",
               maxHeight: "70vh",
               maxWidth: "100%",
               overflow: "auto",
            }}
         >
            {api_devices.isLoading ? <p>Loading...</p> : renderCells()}
         </div>
      </Modal>
   );
};

export default DevicePositionModal;
