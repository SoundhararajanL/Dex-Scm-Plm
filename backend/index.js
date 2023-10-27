const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv/config');
const cors = require('cors');

// Middleware
app.use(express.json()); 
app.use(morgan('dev'));
app.use(cors());


// Router
const routes = require('./routes');
app.use('/api', routes); // Use '/api' as the base route path 

// Start the server
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose
  .connect(process.env.MYDB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connected successfully');
    // Start the server after the connection is established
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('DB not connected', err);
  });
