const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/api/grippers', (req, res) => {
  try {
    const dataFilePath = path.join(__dirname, 'data.json');
    
    // Read existing data from data.json
    const rawData = fs.readFileSync(dataFilePath);
    const jsonData = JSON.parse(rawData);

    // Add new gripper data to the array
    const newGripperData = req.body;
    jsonData.push(newGripperData);

    // Write updated data back to data.json
    fs.writeFileSync(dataFilePath, JSON.stringify(jsonData, null, 2));

    res.status(200).json({ message: 'Gripper added successfully' });
  } catch (error) {
    console.error('Error adding gripper:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
