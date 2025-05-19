// dotenv
//express instance
//load variables
//enable all important middleware
//create all routes
//load more middleware - eg error handlers
//start the server

import express from "express"
import dotenv from 'dotenv'
import cookieParser from "cookie-parser"
import cors from "cors"
import { notFound } from "./middlewares/errorMiddlewares"
import authRoutes from "./routes/authRoutes"
import { getUsers } from "./controllers/usersController"
import usersRoutes from "./routes/usersRoutes"
import baptismRoutes from "./routes/baptismRoutes"
import eucharistRoutes from "./routes/eucharistRoutes"
import confirmRoutes from "./routes/confirmRoutes"
import marriageRoutes from "./routes/marriageRoutes"
import parishRoutes from "./routes/parishRoutes"

//1:configure the dotenv
dotenv.config()

//2:instance of express
const app = express()

//NEVER IN YOUR LIFE FORGET THIS
//3:middle wares
app.use(express.json()) // for parsing application/json3
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
//Cookie parser middleware
app.use(cookieParser())


const allowedOrigins = ['http://localhost:5173', 'http://localhost:4200', 'https://christian-biodata.vercel.app'];

//CORS middleware
app.use(cors({
    origin: allowedOrigins,
    methods: "GET, POST, PUT, PATCH, DELETE",
    credentials: true // allows cookies and auth headers
}))



//4:create the routes
app.use("/api/users", usersRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/baptism", baptismRoutes)
app.use("/api/eucharist", eucharistRoutes)
app.use("/api/confirmation", confirmRoutes)
app.use("/api/marriage", marriageRoutes)
app.use("/api/parish", parishRoutes)


app.get('', (req, res) => {
    res.json({ message: "Frontend successfully connected to backend!" });
});


//5:middlewares after the routes
app.use(notFound)



// start the server

const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`🚀🚀Server is running on port: ${port}`)
})
