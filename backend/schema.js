const mongoose = require('mongoose');

const gripperDataSchema = new mongoose.Schema({
  Property: String,
  
  Value: mongoose.Schema.Types.Mixed,
});

const gripperSchema = new mongoose.Schema({
  "Model Name": String,
  Data: [gripperDataSchema],
});

module.exports = mongoose.model('Gripper', gripperSchema);
