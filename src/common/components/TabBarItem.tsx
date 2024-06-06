import { TabBar } from 'antd-mobile';
import { ReactNode } from 'react';

interface TabBarItemProps {
   key: string;
   icon: ReactNode;
   title: string;
   badge?: ReactNode;
   onClick: () => void;
}

const TabBarItem = ({ key, icon, title, badge, onClick }: TabBarItemProps) => {
   return (
      <div onClick={onClick} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
         <TabBar.Item key={key} icon={icon} title={title} badge={badge} />
      </div>
   );
};

export default TabBarItem;
