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

module.exports = router;
