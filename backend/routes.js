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
      return null; // Handle missing or non-numeric values as null
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

    const payloadMin = Math.min(...payloadValues.filter((value) => value !== null));
    const payloadMax = Math.max(...payloadValues.filter((value) => value !== null));

    const forceMin = Math.min(...forceValues.filter((value) => value !== null));
    const forceMax = Math.max(...forceValues.filter((value) => value !== null));

    const pressureMin = Math.min(...pressureValues.filter((value) => value !== null));
    const pressureMax = Math.max(...pressureValues.filter((value) => value !== null));
    const dimensionValues = grippers.map((gripper) => {
      const dimensionValue = gripper.Data.find((data) => data.Property === 'Dimension(MM)').Value;

      if (!dimensionValue) {
        return null;
      }

      const [min, max] = dimensionValue.split('-').map(parseFloat);
      return { min, max };
    }).filter(Boolean); // Remove null entries (dimensions with empty ranges)

    const dimensionMin = Math.min(...dimensionValues.map((value) => value.min));
    const dimensionMax = Math.max(...dimensionValues.map((value) => value.max));
    const minMaxValues = {
      dimensionMin,
      dimensionMax,
      payloadMin,
      payloadMax,
      forceMin,
      forceMax,
      pressureMin,
      pressureMax,
    };

    res.status(200).json(minMaxValues);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error occurred while fetching grippers.' });
  }
});

module.exports = router;
