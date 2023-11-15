const express = require('express');
const router = express.Router();
const Gripper = require('./schema');

// Get all grippers
router.get('/grippers', async (req, res) => {
  try {
    const grippers = await Gripper.find();
    res.status(200).json(grippers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error occurred while fetching grippers.' });

  }
});

router.get('/grippers/minmax', async (req, res) => {
  try {
    const grippers = await Gripper.find();

    if (!Array.isArray(grippers)) {
      return res.status(500).json({ error: 'Grippers data is not an array.' });
    }

    const extractNumericValue = (data, property) => {
      const valueData = data.find((item) => item.Property === property);
      if (valueData) {
        const numericValue = parseFloat(valueData.Value);
        if (!isNaN(numericValue)) {
          return numericValue;
        }
      }
      return null; 
    };

    const payloadValues = grippers.map((gripper) =>
      extractNumericValue(gripper.Data, 'Payload(Kg)')
    );

    const forceValues = grippers.map((gripper) =>
      extractNumericValue(gripper.Data, 'Gripping Force')
    );

    const pressureValues = grippers.map((gripper) =>
      extractNumericValue(gripper.Data, 'Feed pressure Max')
    );

    const DimensionHeightValues = grippers.map((gripper) =>
      extractNumericValue(gripper.Data, 'DimensionHeight(MM)')
    );


    const DimensionDepthValues = grippers.map((gripper) =>
      extractNumericValue(gripper.Data, 'DimensionDepth(MM)')
    );

    const DimensionWidthValues = grippers.map((gripper) =>
      extractNumericValue(gripper.Data, 'DimensionWidth(MM)')
    );

    const payloadMin = Math.min(...payloadValues.filter((value) => value !== null));
    const payloadMax = Math.max(...payloadValues.filter((value) => value !== null));

    const forceMin = Math.min(...forceValues.filter((value) => value !== null));
    const forceMax = Math.max(...forceValues.filter((value) => value !== null));

    const pressureMin = Math.min(...pressureValues.filter((value) => value !== null));
    const pressureMax = Math.max(...pressureValues.filter((value) => value !== null));

    const DimensionHeightValuesMin = Math.min(...DimensionHeightValues.filter((value) => value !== null));
    const DimensionHeightValuesMax = Math.max(...DimensionHeightValues.filter((value) => value !== null));

    const DimensionDepthValuesMin = Math.min(...DimensionDepthValues.filter((value) => value !== null));
    const DimensionDepthValuesMax = Math.max(...DimensionDepthValues.filter((value) => value !== null));

    const DimensionWidthValuesMin = Math.min(...DimensionWidthValues.filter((value) => value !== null));
    const DimensionWidthValuesMax = Math.max(...DimensionWidthValues.filter((value) => value !== null));




    const minMaxValues = {

      payloadMin,
      payloadMax,
      forceMin,
      forceMax,
      pressureMin,
      pressureMax,
      DimensionHeightValuesMin,
      DimensionHeightValuesMax,
      DimensionDepthValuesMin,
      DimensionDepthValuesMax,
      DimensionWidthValuesMin,
      DimensionWidthValuesMax


    };

    res.status(200).json(minMaxValues);

   
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error occurred while fetching grippers.' });
  }
});


// Create a new gripper
router.post('/grippers', async (req, res) => {
  try {
    const newGripper = new Gripper(req.body);
    await newGripper.save();
    res.status(201).json(newGripper);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error occurred while creating a gripper.' });
  }
});

module.exports = router;