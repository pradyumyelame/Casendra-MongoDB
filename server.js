const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 5000;

// Enable CORS
app.use(cors());

// Middleware to parse JSON data
app.use(bodyParser.json());

// MongoDB Connection (Updated: Removed deprecated options)
mongoose
  .connect("mongodb://localhost:27017/22510063_db")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Error connecting to MongoDB:", err));

// Country Schema
const countrySchema = new mongoose.Schema({
  country: { type: String, required: true, unique: true },
  capital: { type: String, required: true },
  population: { type: Number, required: true },
});

const Country = mongoose.model("Country", countrySchema);

// 🔄 Submit Route - Insert Data
app.post("/submit", async (req, res) => {
  const { country, capital, population } = req.body;

  // Validate input
  if (!country || !capital || !population || isNaN(Number(population))) {
    return res.status(400).json({ error: "All fields are required and population must be a number" });
  }

  try {
    const newCountry = new Country({
      country,
      capital,
      population: Number(population),
    });

    await newCountry.save();
    res.status(200).json({ message: "✅ Data inserted successfully" });
  } catch (err) {
    console.error("❌ Error inserting data:", err.message);
    if (err.code === 11000) {
      return res.status(400).json({ error: "❗ Country already exists" });
    }
    res.status(500).json({ error: "❌ Error inserting data", details: err.message });
  }
});

// 📥 Get All Countries
app.get("/countries", async (req, res) => {
  try {
    const countries = await Country.find({});
    res.status(200).json(countries);
  } catch (err) {
    console.error("❌ Error fetching countries:", err);
    res.status(500).json({ error: "Error fetching countries" });
  }
});

// ❌ Delete Country
app.delete("/countries/:country", async (req, res) => {
  const { country } = req.params;
  try {
    const result = await Country.deleteOne({ country });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Country not found" });
    }
    res.status(200).json({ message: "✅ Country deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting country:", err);
    res.status(500).json({ error: "Error deleting country" });
  }
});

// 🔁 Update Country
app.put("/countries/:country", async (req, res) => {
  const { country } = req.params;
  const { newCountry, capital, population } = req.body;

  if (!country || (!newCountry && !capital && !population)) {
    return res.status(400).json({ error: "Invalid or missing parameters" });
  }

  try {
    const updateData = {};
    if (newCountry) updateData.country = newCountry;
    if (capital) updateData.capital = capital;
    if (population) updateData.population = Number(population);

    const result = await Country.updateOne({ country }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Country not found" });
    }

    res.status(200).json({ message: "✅ Country updated successfully" });
  } catch (err) {
    console.error("❌ Error updating country:", err);
    res.status(500).json({ error: "Error updating country" });
  }
});

// 🚀 Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
