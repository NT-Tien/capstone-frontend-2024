import MobileNavbar from "@/common/components/MobileNavBar"
import { Card } from "antd"
import { BellFilled, HomeFilled, PhoneFilled, SettingFilled } from "@ant-design/icons"
import { Button, NavBar } from "antd-mobile"
import { ClockCircleOutline } from "antd-mobile-icons"
import { useState } from "react"
import MobileNavBarTest from "@/common/components/MobileNavBarTest"

const DashBoard = () => {
   const [currentRoute, setCurrentRoute] = useState("home")

   const cardStyle = {
      backgroundColor: "#D9D9D9",
      width: "5rem",
      height: "5rem",
      borderRadius: "1rem",
   }

   const cards = Array(4)
      .fill(null)
      .map((_, index) => <Card key={index} style={cardStyle} />)

   type ButtonStyleProps = {
      color: string
      textColor?: string
      borderColor?: string
   }

   type CardComponentProps = {
      buttonColor: string
      buttonText: string
      buttonTextColor?: string
      borderColor?: string
   }

   const buttonStyle = ({ color, textColor = "white", borderColor = "transparent" }: ButtonStyleProps) => ({
      backgroundColor: color,
      fontSize: "16px",
      color: textColor,
      borderRadius: "5rem",
      borderColor: borderColor,
   })

   const CardComponent = ({
      buttonColor,
      buttonText,
      buttonTextColor = "white",
      borderColor = "transparent",
   }: CardComponentProps) => (
      <div className={`card`} style={{ marginTop: "1rem" }}>
         <Card style={{ backgroundColor: "#FEF7FF", marginLeft: "1rem", marginRight: "1rem", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <div>
                  <p style={{ fontSize: "16px", fontWeight: "bold" }}>Mechanical Failure</p>
                  <p style={{ fontSize: "16px" }}>28/05/2024 - AABBCC333</p>
               </div>
               <div>
                  <Button style={buttonStyle({ color: buttonColor, textColor: buttonTextColor, borderColor })}>
                     {buttonText}
                  </Button>
               </div>
            </div>
         </Card>
      </div>
   )

   const cardData = [
      { id: 1, buttonColor: "#F97316", buttonText: "Feedback" },
      { id: 2, buttonColor: "#10B981", buttonText: "Completed" },
      { id: 3, buttonColor: "#F97316", buttonText: "Feedback" },
      { id: 4, buttonColor: "#d3d0d6", buttonText: "Pending", buttonTextColor: "black", borderColor: "#79747E" },
      { id: 5, buttonColor: "#F97316", buttonText: "Feedback" },
      { id: 6, buttonColor: "#F97316", buttonText: "Feedback" },
   ]
   return (
         <div style={{}}>
            <div
               style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1000, // ensure it stays on top of other elements
                  boxShadow: "0 -2px 5px rgba(0,0,0,0.2)",
                  backgroundColor: "white",
               }}
            >
               <NavBar right={<p style={{ fontSize: "20px" }}>&#9776;</p>} />
            </div>
            <div style={{ marginLeft: "2rem", marginTop: "0.5rem" }}>
               <p style={{ fontSize: "24px", margin: 0, padding: 0 }}>Hello there</p>
               <p style={{ fontSize: "30px", fontWeight: "bold", margin: 0, padding: 0 }}>Sang Dang</p>
            </div>
            <div style={{ display: "flex", marginTop: "1rem", justifyContent: "space-evenly" }}>{cards}</div>
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-around" }}>
               <p style={{ display: "flex", fontSize: "22px", fontWeight: "bold" }}>
                  <ClockCircleOutline />
                  Your Previous Reports
               </p>
               <p style={{ color: "#6750A4", fontSize: "16px", display: "inline" }}>See all</p>
            </div>
            <div>
               {cardData.map(({ id, buttonColor, buttonText, buttonTextColor, borderColor }) => (
                  <CardComponent
                     key={id}
                     buttonColor={buttonColor}
                     buttonText={buttonText}
                     buttonTextColor={buttonTextColor}
                     borderColor={borderColor}
                  />
               ))}
            </div>
            <div
               className="navBar"
               style={{
                  position: "sticky",
                  bottom: 0,
                  width: "100%",
                  backgroundColor: "#F3EDF7",
                  zIndex: 1000, // ensure it stays on top of other elements
                  boxShadow: "0 -2px 5px rgba(0,0,0,0.2)", // optional: adds some shadow for better visibility
               }}
            >
               {/* <MobileNavbar
               currentActive={currentRoute}
               items={[
                  {
                     name: "Home",
                     icon: <HomeFilled />,
                     key: "home",
                     onClick: () => setCurrentRoute("home"),
                  },
                  {
                     name: "Devices",
                     icon: <PhoneFilled />,
                     key: "profile",
                     onClick: () => setCurrentRoute("profile"),
                  },
                  {
                     name: "Notifications",
                     icon: <BellFilled />,
                     key: "notifications",
                     onClick: () => setCurrentRoute("notifications"),
                     countBadge: 3,
                  },
                  {
                     name: "Settings",
                     icon: <SettingFilled />,
                     key: "settings",
                     onClick: () => setCurrentRoute("settings"),
                  },
               ]}
            /> */}
               <MobileNavBarTest/>
            </div>
         </div>
   )
}

export default DashBoard
