//importing express, environmental variables, bodyparser, router, database connection function and declaring them in a varibale to be using it in our index.js file
const express = require('express');
const dotenv = require('dotenv');
const ConnectDB = require('./DB/mysqldb');
const app = express();
const router = require('./Routes/routes');
const bodyParser = require('body-parser');
const cors = require("cors")
dotenv.config();
//using the port in environmental variable or 5000
const port = process.env.PORT || 3000;

// middleware to parse incoming request in bodies
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL ,
  credentials: true
}))
// initialize the database connection pool
let pool;

(async () => {
    try {
        pool = ConnectDB.pool;
        console.log('Pool initialized:', !!pool);

        // Test database connection
        const conn = await pool.getConnection();
        console.log('Database connected successfully');
        conn.release();

        // pass the pool to the routes
        app.use((req, res, next) => {
            req.pool = pool;
            next();
        });

        // use the router
        app.use("/api", router);

        // start the server
        app.listen(port, () => {
            console.log(`Example app listening on port http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Startup error:', error);
        process.exit(1);
    }
})();