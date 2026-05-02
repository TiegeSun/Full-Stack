const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const options = {}

    if (process.env.MONGO_TLS_ALLOW_INVALID_CERTIFICATES === 'true') {
      options.tlsAllowInvalidCertificates = true
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, options)

    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

module.exports = connectDB
