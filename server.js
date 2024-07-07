const express = require('express');
const authRouter = require('./routes/user.route.js');
const orgRouter = require('./routes/org.route.js');
const { isAuthenticated } = require('./middleware/auth.js')
// const { connectToMongoDB } = require('./db/db.js');
const { sequelize, createDatabase } = require('./db/dbConnect.js')
const { syncModels } = require('./models/index.js')
const app = express();
const PORT = 5000

// connectToMongoDB()
app.use(express.json())


app.get('/', (req, res) => {
    res.send('Hello from express')
})

app.use('/api', isAuthenticated, orgRouter)
app.use('/', authRouter)




const startServer = async () => {
    try {
      await createDatabase();
      await sequelize.authenticate();
      await syncModels();
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('Unable to start server:', error);
    }
  };
  
  startServer();
