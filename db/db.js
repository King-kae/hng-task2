const mongoose = require('mongoose');
require('dotenv').config()
const MONGODB_URL = process.env.MONGODB_URL


// Connect to MongoDB Atlas
function connectToMongoDB() {
    mongoose.connect(MONGODB_URL)


    mongoose.connection.on('connected', () => {
        console.log('Connected to MongoDB successfully')
    })

    mongoose.connection.on('error', (err) => {
        console.log(`Error connecting to Mongo ${err.message}`)
    });
}

module.exports = { connectToMongoDB }
