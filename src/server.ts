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
import usersRoutes from "./routes/usersRoutes"
import baptismRoutes from "./routes/baptismRoutes"
import eucharistRoutes from "./routes/eucharistRoutes"
import confirmRoutes from "./routes/confirmRoutes"
import parishRoutes from "./routes/parishRoutes"
import marriageDocumentRoutes from "./routes/marriageDocumentRoutes"
import marriagePartiesRoutes from "./routes/marriagePartiesRoutes"
import marriages2Routes from "./routes/marriages2Routes"
import path from "path"


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


const allowedOrigins = ['http://localhost:5173', 'http://localhost:4200', 'https://christian-biodata-git-main-joshmiths-projects.vercel.app'];

//CORS middleware
app.use(cors({
    // origin: allowedOrigins,
    origin: true,
    methods: "GET, POST, PUT, PATCH, DELETE",
    credentials: true // allows cookies and auth headers
}))



//4:create the routes
app.use("/users", usersRoutes)
app.use("/auth", authRoutes)
app.use("/baptism", baptismRoutes)
app.use("/eucharist", eucharistRoutes)
app.use("/confirmation", confirmRoutes)
app.use("/marriages", marriages2Routes)
app.use("/marriage-documents", marriageDocumentRoutes)
app.use("/marriage-parties", marriagePartiesRoutes)
app.use("/parish", parishRoutes)
app.use('/marriage-documents/download', express.static(
    path.join(__dirname, 'uploads', 'marriage_documents'), 
    {
        setHeaders: (res, filePath) => {
            const filename = path.basename(filePath);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            
            const ext = path.extname(filename).toLowerCase();
            const contentType = {
                '.pdf': 'application/pdf',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.doc': 'application/msword',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            }[ext] || 'application/octet-stream';
            
            res.setHeader('Content-Type', contentType);
        }
    }
));


app.get('', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>CCB-Sys Backend</title>
            <style>
                body {
                    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
                    color: #fff;
                    font-family: 'Segoe UI', Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                }
                .container {
                    background: rgba(0,0,0,0.5);
                    padding: 2rem 3rem;
                    border-radius: 18px;
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                    text-align: center;
                }
                h1 {
                    margin-bottom: 0.5rem;
                    font-size: 2.5rem;
                    letter-spacing: 2px;
                }
                p {
                    margin-top: 0;
                    font-size: 1.2rem;
                }
                .badge {
                    display: inline-block;
                    margin-top: 1rem;
                    padding: 0.4em 1em;
                    background: #fff;
                    color: #2575fc;
                    border-radius: 999px;
                    font-weight: bold;
                    font-size: 1rem;
                    letter-spacing: 1px;
                }
                a {
                    color: #fff;
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Welcome to CCB-Sys Backend 🚀</h1>
                <p>Your backend server is up and running!</p>
                <span class="badge">Status: Online</span>
                <p style="margin-top:2rem;">
                    <a href="https://christian-biodata-git-main-joshmiths-projects.vercel.app" target="_blank">View Site</a>
                </p>
            </div>
        </body>
        </html>
    `);
});


//5:middlewares after the routes
app.use(notFound)



// start the server

const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`🚀🚀Server is running on port: ${port}`)
})
