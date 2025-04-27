const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Create table if it doesn't exist
pool.query(
  `
    CREATE TABLE IF NOT EXISTS study (
      id SERIAL PRIMARY KEY,
      country VARCHAR(100),
      qualification VARCHAR(50),
      age VARCHAR(20),
      education_topic VARCHAR(100),
      cgpa VARCHAR(20),
      budget VARCHAR(50),
      needs_loan BOOLEAN,
      name VARCHAR(100),
      email VARCHAR(100),
      phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  (err, res) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Table created or already exists');
    }
  }
);

// Endpoint to receive form submission
app.post('/submit-form', (req, res) => {
    const formData = req.body;
    
    // Log the received data to console
    console.log('Received form submission:', formData);
    
    // Insert data into the database
    const query = `
      INSERT INTO study (
        country, qualification, age, education_topic, cgpa, budget,
        needs_loan, name, email, phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      formData.selectedCountry,
      formData.selectedQualification,
      formData.selectedAge,
      formData.selectedEducationTopic,
      formData.currentCgpa,
      formData.selectedBudget,
      formData.needsLoan,
      formData.name,
      formData.email,
      formData.phone
    ];
    
    pool.query(query, values, (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }
      
      console.log('Data inserted successfully:', result.rows[0]);
      res.status(200).json({
        success: true,
        message: 'Form submitted successfully',
        data: result.rows[0]
      });
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});