const app = require('./app')
const DatabaseConn = require('./config/database')
const cloudinary = require('cloudinary')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const { SUCCESS_MESSAGES } = require('./helper/messages')
require('dotenv').config()
// dotenv.config({path:"./config/config.env"})
const PORT = process.env.PORT

app.use(
  helmet({
    dnsPrefetchControl: false,
    frameguard: false,
    ieNoOpen: false
  })
)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

DatabaseConn()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const server = app.listen(PORT, () => {
  console.log(`${SUCCESS_MESSAGES.SERVER_STARTED} ${PORT}`)
})
