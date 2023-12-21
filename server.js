const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');
const cors = require('cors');  
const app = express();
const port = 3001; 
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(cors()); 
app.use(bodyParser.json());


app.get('/api/grippers/minmax', async (req, res) => {
  try {
    const jsonData = await fs.readFile('../src/data.json', 'utf-8');
    const grippers = JSON.parse(jsonData);

    if (!Array.isArray(grippers)) {
      return res.status(500).json({ error: 'Grippers data is not an array.' });
    }

    const extractNumericValue = (data, property) => {
      const valueData = data.find((item) => item.Property === property);
      // Skip null or empty values for specific properties
      if (
        (property === 'ManufactureName' || property === 'Type' || property === 'Category') &&
        (!valueData || !valueData.Value)
      ) {
        return null;
      }

      if (valueData && !isNaN(parseFloat(valueData.Value))) {
        return parseFloat(valueData.Value);
      }
      return null;
    };

    const payloadValues = grippers.map((gripper) =>
      extractNumericValue(gripper.Data, 'Payload(Kg)')
    ).filter((value) => value !== null);

    const forceValues = grippers.map((gripper) =>
      extractNumericValue(gripper.Data, 'Gripping Force')
    ).filter((value) => value !== null);

    const pressureValues = grippers.map((gripper) =>
      extractNumericValue(gripper.Data, 'Feed pressure Max')
    ).filter((value) => value !== null);

    const DimensionHeightValues = grippers.map((gripper) =>
      extractNumericValue(gripper.Data, 'DimensionHeight(MM)')
    ).filter((value) => value !== null);

    const DimensionDepthValues = grippers.map((gripper) =>
      extractNumericValue(gripper.Data, 'DimensionDepth(MM)')
    ).filter((value) => value !== null);

    const DimensionWidthValues = grippers.map((gripper) =>
      extractNumericValue(gripper.Data, 'DimensionWidth(MM)')
    ).filter((value) => value !== null);

    const minMaxValues = {
      payloadMin: Math.min(...payloadValues),
      payloadMax: Math.max(...payloadValues),
      forceMin: Math.min(...forceValues),
      forceMax: Math.max(...forceValues),
      pressureMin: Math.min(...pressureValues),
      pressureMax: Math.max(...pressureValues),
      DimensionHeightValuesMin: Math.min(...DimensionHeightValues),
      DimensionHeightValuesMax: Math.max(...DimensionHeightValues),
      DimensionDepthValuesMin: Math.min(...DimensionDepthValues),
      DimensionDepthValuesMax: Math.max(...DimensionDepthValues),
      DimensionWidthValuesMin: Math.min(...DimensionWidthValues),
      DimensionWidthValuesMax: Math.max(...DimensionWidthValues),
    };

    res.status(200).json(minMaxValues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching min and max values.' });
  }
});



app.post('/api/updateData', async (req, res) => {
  try {
    // Read the existing data.json file
    const jsonData = await fs.readFile('../src/data.json', 'utf-8');
    const existingData = JSON.parse(jsonData);

    // Add the new gripper data to the existing data
    existingData.push(req.body.newGripper);

    // Write the updated data back to data.json
    await fs.writeFile('../src/data.json', JSON.stringify(existingData, null, 2), 'utf-8');

    // Respond with the updated data (you may choose to send a success message or just the updated data)
    res.json(existingData);
    console.log('Data updated successfully.');
  } catch (error) {
    console.error('Error updating data.json:', error);
    res.status(500).json({ error: `Failed to update data.json: ${error.message}` });
  }
});

app.delete('/api/deleteGripper/:modelName', async (req, res) => {
  try {
    const modelNameToDelete = req.params.modelName;

    // Read the existing data.json file
    const jsonData = await fs.readFile('../src/data.json', 'utf-8');
    const existingData = JSON.parse(jsonData);

    // Find the index of the gripper with the specified model name
    const gripperIndexToDelete = existingData.findIndex(
      (gripper) => gripper['Model Name'] === modelNameToDelete
    );

    // If the gripper is found, remove it from the array
    if (gripperIndexToDelete !== -1) {
      existingData.splice(gripperIndexToDelete, 1);

      // Write the updated data back to data.json
      await fs.writeFile('../src/data.json', JSON.stringify(existingData, null, 2), 'utf-8');

      // Respond with the updated data (you may choose to send a success message or just the updated data)
      res.json(existingData);
      console.log(`Gripper ${modelNameToDelete} deleted successfully.`);
    } else {
      // Gripper not found
      res.status(404).json({ error: `Gripper ${modelNameToDelete} not found.` });
    }
  } catch (error) {
    console.error('Error deleting gripper:', error);
    res.status(500).json({ error: `Failed to delete gripper: ${error.message}` });
  }
});






app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});