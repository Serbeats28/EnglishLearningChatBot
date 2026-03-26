require('dotenv').config()
const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const appConfig = require('./config/database.js') 
// const dbConfig = appConfig['production'] || appConfig['development']
const cors = require('cors') 
const routes = require('./router/routes')
const PORT = process.env.PORT || 2800
const apiKey = process.env.APIKEY
// const { Pool } = require('pg')
const supabase = require('./config/supabase.js')

app.use(cookieParser())
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors({
    // origin: 'http://10.0.2.48:8081', // Your Vue dev port
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'api-key'],
    maxAge: 86400 // Browser remembers for 24 hours
}))


// const pool = new Pool(dbConfig)
app.use((req, res, next)=>{
    if(req.header('api-key') !== apiKey && req.path !== '/api/test'){
        return res.json({error_message: "Can't Access ChatBot Api"})
    }

    next()
})
app.get('/favicon.ico', (req, res) => res.status(204).end())
app.use(async (req, res, next)=>{
    try {
        res.locals.pool = supabase
        next()
    } catch (err) {
        console.log("database error:",err.message)
    }
})
app.use('/api',routes)
app.listen(PORT)

