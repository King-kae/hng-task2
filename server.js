const express = require('express');
const authRouter = require('./routes/user.route.js');
const orgRouter = require('./routes/org.route.js');
const { isAuthenticated } = require('./middleware/auth.js')
const { sequelize } = require('./db/dbConnect.js')
const { syncModels } = require('./models/index.js')
require('dotenv').config()
const app = express();
const PORT = process.env.PORT || 5000

app.use(express.json())


app.get('/', (req, res) => {
    res.send('Hello from express')
})

app.use('/api', isAuthenticated, orgRouter)
app.use('/', authRouter)




const startServer = async () => {
    try {
      await sequelize.authenticate();  // Authenticate connection
      await syncModels();  // Sync models
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('Unable to start server:', error);
    }
  };
  
  startServer();

  module.exports = app
