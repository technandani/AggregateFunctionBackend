const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGODB_URL;
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  city: String,
});

const User = mongoose.model('Data', userSchema);

app.post('/data', async (req, res) => {
  const { name, age, city } = req.body;
  const newData = new User({ name, age, city });
  try {
    await newData.save();
    res.json({ message: 'Data added successfully', data: newData });
  } catch (error) {
    res.status(500).json({ message: 'Error adding data', error });
  }
});

app.get('/aggregate', async (req, res) => {
  try {
    const groupedByCity = await User.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } }
    ]);

    const averageAge = await User.aggregate([
      { $group: { _id: null, avgAge: { $avg: '$age' } } }
    ]);

    const sortedByAge = await User.aggregate([
      { $sort: { age: 1 } }
    ]);

    res.json({
      groupedByCity,
      averageAge: averageAge[0]?.avgAge || 0,
      sortedByAge
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in aggregation', error });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
