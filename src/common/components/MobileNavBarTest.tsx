import { Badge, TabBar } from "antd-mobile"
import { AppstoreOutline, ClockCircleOutline, SetOutline, SystemQRcodeOutline } from "antd-mobile-icons"
import { useRouter } from 'next/navigation';
import { ReactNode } from "react";
import TabBarItem from "./TabBarItem";


const MobileNavBarTest = () => {
    const router = useRouter()
   const tabs = [
      {
         key: "home",
         title: "Home",
         icon: <AppstoreOutline />,
         onClick: () => router.push('/head')
      },
      {
         key: "history",
         title: "History",
         icon: <ClockCircleOutline />,
         onClick: () => router.push('/head')
      },
      {
         key: "scan",
         title: "Scan",
         icon: <SystemQRcodeOutline />,
         onClick: () => router.push('/head/ScanQrScreen')
      },
      {
         key: "settings",
         title: "Settings",
         icon: <SetOutline />,
         onClick: () => router.push('/head')
      },
   ]


   return (
      <div>
         <TabBar>
            {tabs.map((item) => (
                    <TabBarItem key={item.key} icon={item.icon} title={item.title} onClick={item.onClick} />
            ))}
         </TabBar>
      </div>
   )
}

export default MobileNavBarTest