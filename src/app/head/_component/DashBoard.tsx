import { Card } from "antd"
import { Button, NavBar } from "antd-mobile"
import { ClockCircleOutline } from "antd-mobile-icons"

const DashBoard = () => {
   return (
      <div>
         <div>
            <NavBar right={<p style={{ fontSize: "20px" }}>&#9776;</p>} />
         </div>
         <div style={{ marginLeft: "2rem", marginTop: "0.5rem" }}>
            <p style={{ fontSize: "24px", margin: 0, padding: 0 }}>Hello there</p>
            <p style={{ fontSize: "30px", fontWeight: "bold", margin: 0, padding: 0 }}>Sang Dang</p>
         </div>
         <div style={{ display: "flex", marginTop: "1rem", justifyContent: "space-evenly" }}>
            <Card style={{ backgroundColor: "#D9D9D9", width: "5rem", height: "5rem", borderRadius: "1rem" }} />
            <Card style={{ backgroundColor: "#D9D9D9", width: "5rem", height: "5rem", borderRadius: "1rem" }} />
            <Card style={{ backgroundColor: "#D9D9D9", width: "5rem", height: "5rem", borderRadius: "1rem" }} />
            <Card style={{ backgroundColor: "#D9D9D9", width: "5rem", height: "5rem", borderRadius: "1rem" }} />
         </div>
         <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "space-around" }}>
            <p style={{ display: "flex", fontSize: "24px", fontWeight: "bold" }}>
               <ClockCircleOutline />
               Your Previous Reports
            </p>
            <p style={{ color: "#6750A4", fontSize: "20px", display: "inline" }}>See all</p>
         </div>
         <div style={{ marginTop: "0.5rem" }}>
            <Card
               style={{ backgroundColor: "#FEF7FF", marginLeft: "1rem", marginRight: "1rem", marginBottom: "0.5rem" }}
            >
               <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <div>
                     <p style={{ fontSize: "18px", fontWeight: "bold" }}>Mechanical Failure</p>
                     <p style={{ fontSize: "18px" }}>28/05/2024 - AABBCC333</p>
                  </div>
                  <div>
                    <Button style={{ backgroundColor: '#F97316' }}>Feedback</Button>
                  </div>
               </div>
            </Card>
         </div>
      </div>
   )
}

export default DashBoard
