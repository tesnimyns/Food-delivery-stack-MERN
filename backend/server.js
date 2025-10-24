import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import chatbotRouter from "./routes/chatbotRoute.js"

//app configuration
const app = express()
const port = 4000

//middleware
app.use(express.json())
app.use(cors())// access any backend from any frontend 
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)
app.use('/dialogflow', chatbotRouter); 

//DB connetion 
connectDB();

//api endpoints
app.use("/api/food",foodRouter)
app.use("/images",express.static('uploads')) //ken nhot ay img f uploads i can access it from localhost:4000/images/id de photo 
app.use("/api/user",userRouter)


app.get("/",(req,res)=>{
    res.send("API Working")
}) 
//http method request the data from server

app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
})


//mongodb+srv://tesnimyounes:14037534@cluster0.xzvavgs.mongodb.net/?