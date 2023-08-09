const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const baseRoutes = require('./routes')
const compression = require('compression')
const xss = require('xss-clean')

app.use(cors())
app.use(compression())
const cookieParser = require('cookie-parser')
const errorMiddleware = require('./middleware/error')

app.use(xss())
app.use(express.json({ limit: '25mb' }))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ limit: '25mb', extended: true }))
app.use(fileUpload({
    parseNested: true,
    limits: { fileSize: 50 * 1024 *1024 },
    useTempFiles : true,
    tempFileDir : '/tmp/'
}))

app.use('/api/flippy/v1', baseRoutes)

app.use(errorMiddleware)

module.exports = app
