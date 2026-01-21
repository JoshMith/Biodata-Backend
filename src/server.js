"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const errorMiddlewares_1 = require("./middlewares/errorMiddlewares");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const usersRoutes_1 = __importDefault(require("./routes/usersRoutes"));
const baptismRoutes_1 = __importDefault(require("./routes/baptismRoutes"));
const eucharistRoutes_1 = __importDefault(require("./routes/eucharistRoutes"));
const confirmRoutes_1 = __importDefault(require("./routes/confirmRoutes"));
const parishRoutes_1 = __importDefault(require("./routes/parishRoutes"));
const marriageDocumentRoutes_1 = __importDefault(require("./routes/marriageDocumentRoutes"));
const marriagePartiesRoutes_1 = __importDefault(require("./routes/marriagePartiesRoutes"));
const marriageRoutes_1 = __importDefault(require("./routes/marriageRoutes"));
const path_1 = __importDefault(require("path"));
//1:configure the dotenv
dotenv_1.default.config();
//2:instance of express
const app = (0, express_1.default)();
//NEVER IN YOUR LIFE FORGET THIS
//3:middle wares
app.use(express_1.default.json()); // for parsing application/json3
app.use(express_1.default.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//Cookie parser middleware
app.use((0, cookie_parser_1.default)());
const allowedOrigins = ['https://cbms.adnyeri.org', 'http://localhost:4200'];
//CORS middleware
app.use((0, cors_1.default)({
    // origin: allowedOrigins,
    origin: true,
    methods: "GET, POST, PUT, PATCH, DELETE",
    credentials: true // allows cookies and auth headers
}));
//4:create the routes
app.use("/users", usersRoutes_1.default);
app.use("/auth", authRoutes_1.default);
app.use("/baptism", baptismRoutes_1.default);
app.use("/eucharist", eucharistRoutes_1.default);
app.use("/confirmation", confirmRoutes_1.default);
app.use("/marriages", marriageRoutes_1.default);
app.use("/marriage-documents", marriageDocumentRoutes_1.default);
app.use("/marriage-parties", marriagePartiesRoutes_1.default);
app.use("/parish", parishRoutes_1.default);
app.use('/marriage-documents/download', express_1.default.static(path_1.default.join(__dirname, 'uploads', 'marriage_documents'), {
    setHeaders: (res, filePath) => {
        const filename = path_1.default.basename(filePath);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        const ext = path_1.default.extname(filename).toLowerCase();
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
}));
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
                    <a href="https://cbms.adnyeri.org" target="_blank">View Site</a>
                </p>
            </div>
        </body>
        </html>
    `);
});
//5:middlewares after the routes
app.use(errorMiddlewares_1.notFound);
// start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`🚀🚀Server is running on port: ${port}`);
});
