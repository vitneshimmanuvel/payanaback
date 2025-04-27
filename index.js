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
      console.error('Error creating study table:', err);
    } else {
      console.log('Study table created or already exists');
    }
  }
);

// Create work_profiles table
pool.query(
  `
    CREATE TABLE IF NOT EXISTS work_profiles (
      id SERIAL PRIMARY KEY,
      occupation VARCHAR(100),
      education VARCHAR(100),
      experience VARCHAR(100),
      name VARCHAR(100),
      email VARCHAR(100),
      phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  (err, res) => {
    if (err) {
      console.error('Error creating work_profiles table:', err);
    } else {
      console.log('Work_profiles table created or already exists');
    }
  }
);

// Existing study endpoint
app.post('/submit-form', (req, res) => {
  const formData = req.body;
  console.log('Received study form data:', formData); // Log received data

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
      console.error('Error inserting study data:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }
    
    console.log('Study data inserted successfully:', result.rows[0]);
    res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      data: result.rows[0]
    });
  });
});

// New work profile endpoint
app.post('/submit-work-form', (req, res) => {
  const formData = req.body;
  console.log('Received work profile data:', formData); // Log received data

  const query = `
    INSERT INTO work (
      occupation, education, experience, name, email, phone
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [
    formData.occupation,
    formData.education,
    formData.experience,
    formData.name,
    formData.email,
    formData.phone
  ];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting work data:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }
    
    console.log('Work profile data inserted successfully:', result.rows[0]);
    res.status(200).json({
      success: true,
      message: 'Work profile saved successfully',
      data: result.rows[0]
    });
  });
});



// Add this new route for investment forms
app.post('/submit-invest-form', (req, res) => {
  const { name, email, country } = req.body;
  
  const query = `
    INSERT INTO invest (name, email, country)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  pool.query(query, [name, email, country], (err, result) => {
    if (err) {
      console.error('Error inserting investment data:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }
    
    console.log('Investment data inserted successfully:', result.rows[0]);
    res.status(200).json({
      success: true,
      message: 'Investment inquiry submitted successfully',
      data: result.rows[0]
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});