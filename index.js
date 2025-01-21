const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

// for generating id
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 5002;

// Middleware Setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Set Handlebars as the view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));


// Session Configuration
app.use(
  session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
  })
);

// Helper Function to Get Users from JSON
const getUsers = () => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'database', 'user.json'), 'utf-8'));
};
// Route to Render home Page
app.get('/home', (req, res) => {
  res.render('auth/home'); 
});

// Route to Render Sign-In Page
app.get('/signin', (req, res) => {
  res.render('auth/signin'); // Renders the sign-in page
});

// Sign-In Handler
app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  const users = getUsers();

  // Find the user based on email and password
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.send('Invalid credentials');
  }

  // Set session data after successful login
  req.session.userId = user.id;
  req.session.email = user.email;
  req.session.role = user.role;

  // Redirect based on role
  if (user.role === 'doctor') {
    res.redirect('/doctor/dashboard');
  } else if (user.role === 'receptionist') {
    res.redirect('/receptionist/dashboard');
  }
});

// Route to Render Doctor Dashboard


// Doctor Dashboard to view all the queuing patients
app.get('/doctor/dashboard', (req, res) => {
  // Ensure user is logged in and has the correct role
  if (req.session.role !== 'doctor') {
    return res.status(403).send('Access Denied');
  }

  // Read the patient data from the JSON file
  const dataPath = path.join(__dirname, 'database', 'patientData.json');
  
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading patient data:", err);
      return res.status(500).render('error', { message: 'Error reading patient data' });
    }
    
    let patients = [];
    try {
      patients = JSON.parse(data);
      console.log(patients)
    } catch (parseError) {
      console.error("Error parsing patient data:", parseError);
      return res.status(500).render('error', { message: 'Error parsing patient data' });
    }

    // Render the doctor's dashboard with the patient data
    res.render('doctor/dashboard', { 
      email: req.session.email,
      patients: patients
    });
  });
});


// View single patient history 
app.get('/doctor/patient/:id', (req, res) => {
  // Ensure user is logged in and has the correct role
  if (req.session.role !== 'doctor') {
    console.log("Access Denied");
    return res.status(403).send('Access Denied');
  }

  const dataPath = path.join(__dirname, 'database', 'patientData.json');
  const patientId = req.params.id;

  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading patient data:", err);
      return res.status(500).render('error', { message: 'Error reading patient data' });
    }
    
    let patients = [];
    try {
      patients = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing patient data:", parseError);
      return res.status(500).render('error', { message: 'Error parsing patient data' });
    }

    const patient = patients.find(p => p.id === patientId);

    if (!patient) {
      console.log("Patient not found:", patientId);
      return res.status(404).render('error', { message: 'Patient not found' });
    }
    // Render the patient details page with the patient data
    res.render('doctor/patientinfo.hbs', { 
      email: req.session.email,
      patient: patient
    });

    console.log("Found patient ID:", patient.id);
  });
});


app.put('/doctor/patients', (req, res) => {
  console.log("Received request body:", req.body);
  const { patientId } = req.body;
  console.log("Processing request for patient ID:", patientId);
  
  const dataPath = path.join(__dirname, 'database', 'patientData.json');
  
  try {
    if (!fs.existsSync(dataPath)) {
      console.error("Patient data file not found at:", dataPath);
      return res.status(500).json({
        success: false,
        message: "Patient data file not found"
      });
    }

    const fileData = fs.readFileSync(dataPath, 'utf-8');
    let patients = JSON.parse(fileData);
    const patientIndex = patients.findIndex(p => p.id === patientId);
    
    if (patientIndex !== -1) {
      // Update patient data
      patients[patientIndex] = {
        ...patients[patientIndex],
        height: req.body.height,
        heartRate: req.body.heartRate,
        bloodPressure: req.body.bloodPressure,
        glucoseLevel: req.body.glucoseLevel,
        symptoms: req.body.symptoms,
        diagnosis: req.body.diagnosis,
        prescription: req.body.prescription,
      };
      
      fs.writeFileSync(dataPath, JSON.stringify(patients, null, 2), 'utf-8');
      
      // Redirect to the medical records page showing all patients
      res.json({
        success: true,
        message: "Patient data updated successfully"
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: "Patient not found" 
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error",
      error: error.message 
    });
  }
});

app.get('/doctor/medicalrecords', (req, res) => {
  const dataPath = path.join(__dirname, 'database', 'patientData.json');

  try {
    const fileData = fs.readFileSync(dataPath, 'utf-8');
    const patients = JSON.parse(fileData);
    
    // Render the medical records page with all patients' data
    res.render('doctor/medicalrecords', { patients });
  } catch (error) {
    console.error("Error reading patient data:", error);
    return res.status(500).render('error', { message: 'Error reading patient data' });
  }
});


console.log("Patient info route is set up");

// Ensure this file path is correct in your project
const patientInfoPath = path.join(__dirname, 'views', 'doctor', 'patientinfo.hbs');
console.log("Patient info view path:", patientInfoPath);





// Part2
// Route to view the receptionist dashboard with patient data
app.get('/receptionist/dashboard', (req, res) => {
  // Ensure user is logged in and has the correct role
  if (req.session.role !== 'receptionist') {
    return res.status(403).send('Access Denied');
  }

  // Path to the patient data JSON file
  const dataPath = path.join(__dirname, 'database', 'patientData.json');
  
  // Read the patient data from the JSON file
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading patient data:", err);
      return res.status(500).render('error', { message: 'Error reading patient data' });
    }

    let patients = [];
    try {
      patients = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing patient data:", parseError);
      return res.status(500).render('error', { message: 'Error parsing patient data' });
    }

    // Render the receptionist's dashboard with email and patient data
    res.render('receptionist/dashboard', { 
      email: req.session.email,
      patients: patients
    });
  });
});


app.get('/receptionist/editpatient/:id', (req, res) => {
  const patientId = req.params.id;
  const dataPath = path.join(__dirname, 'database', 'patientData.json');
  let existingPatients = [];

  try {
      const fileData = fs.readFileSync(dataPath, 'utf-8');
      existingPatients = JSON.parse(fileData);
  } catch (error) {
      console.error("Error reading patient data:", error);
  }

  const patient = existingPatients.find(p => p.id === patientId);
  if (patient) {
      res.render('editPatient', { patient }); // Render the edit form with patient data
  } else {
      res.status(404).send('Patient not found');
  }
});

app.post('/api/patients/:id',(req,res)=>{

  const formData = req.body;
  console.log( "The id is ",req.body)


  const dataPath = path.join(__dirname, 'database', 'patientData.json');
  try {
      const fileData = fs.readFileSync(dataPath, 'utf-8');
      let patients = JSON.parse(fileData);

      let patientId= formData.id;
      const patientIndex = patients.findIndex(p => p.id === patientId);

      if (patientIndex !== -1) {
       
          patients[patientIndex] = {
              ...patients[patientIndex],
              name: req.body.name,
              age: req.body.age,
              dob: req.body.dob,
              gender: req.body.gender, 
              phone: req.body.phone,
              email: req.body.email,
              address:req.body.address
          };

          fs.writeFileSync(dataPath, JSON.stringify(patients, null, 2), 'utf-8');
          res.json(patients[patientIndex]);
      } else {
          res.status(404).render('error', { message: "Patient not found" });
      }
  } catch (error) {
      console.error("Error reading patient data:", error);
      res.status(500).render('error', { message: "Internal Server Error" });
  }

})


app.post('/receptionist/updatepatient/:id', (req, res) => {
  const patientId = req.params.id;
  const updatedData = {
      id: patientId,
      name: req.body.name,
      age: req.body.age,
      dob: req.body.dob,
      marital_status: req.body.marital_status,
      gender: req.body.gender,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
  };

  const dataPath = path.join(__dirname, 'database', 'patientData.json');
  let existingPatients = [];

  try {
      const fileData = fs.readFileSync(dataPath, 'utf-8');
      existingPatients = JSON.parse(fileData);
  } catch (error) {
      console.error("Error reading patient data:", error);
  }

  const patientIndex = existingPatients.findIndex(p => p.id === patientId);
  if (patientIndex !== -1) {
      existingPatients[patientIndex] = updatedData;
      fs.writeFileSync(dataPath, JSON.stringify(existingPatients, null, 2), 'utf-8');
      res.redirect('/receptionist/patientlist'); // Redirect to the patient list page
  } else {
      res.status(404).send('Patient not found');
  }
});

// ////

// Route to Render Overview Page for doctor
app.get('/overview', (req, res) => {
    res.render('doctor/overview'); // Render the 'overview.hbs' page
  });
// Route to Render patientinfo Page on doctor side
app.get('/patientinformation', (req, res) => {
    res.render('doctor/patientinfo'); 
  });


app.get('/receptionist/addpatient', (req, res) => {
    res.render('receptionist/addpatient'); 
  });

// Route to Handle Patient Registration (Form Submission)
app.post('/receptionist/addpatient', (req, res) => {
    const patientData = {
      id: uuidv4(), // Generate a unique ID
      name: req.body.name,
      age: req.body.age,
      dob: req.body.dob,
      marital_status: req.body.marital_status,
      gender: req.body.gender,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
    };
  
    // Read the existing patient data from JSON file
    const dataPath = path.join(__dirname, 'database', 'patientData.json');
    let existingPatients = [];
  
    try {
      const fileData = fs.readFileSync(dataPath, 'utf-8');
      existingPatients = JSON.parse(fileData);
    } catch (error) {
      console.error("Error reading patient data:", error);
    }
  
    // Add new patient to existing data
    existingPatients.push(patientData);
  
    // Write updated data back to the JSON file
    fs.writeFileSync(dataPath, JSON.stringify(existingPatients, null, 2), 'utf-8');
  
    // Redirect to the patient registration page to clear the form
    res.redirect('/receptionist/addpatient');
  });

// Logout Handler
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send('Error logging out.');
    }
    res.redirect('/signin');
  });
});


app.post('/api/patients/update{{id}}',(res,req)=>{
  const {patientId} = req.body;
  console.log( "The id is ",patientId)

})


// Delete
app.delete('/receptionist/deletepatient/:id', (req, res) => {
  const patientId = req.params.id;
  const dataPath = path.join(__dirname, 'database', 'patientData.json');

  try {
    // Read existing data
    let patients = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    // Find the index of the patient to delete
    const patientIndex = patients.findIndex(patient => patient.id === patientId);
    
    if (patientIndex === -1) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // Remove the patient from the array
    patients.splice(patientIndex, 1);
    
    // Write the updated data back to the file
    fs.writeFileSync(dataPath, JSON.stringify(patients, null, 2), 'utf-8');
    
    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ success: false, message: 'Error deleting patient' });
  }
});

// app.get('/doctor/medicalrecords', (req, res) => {
//   const patientId = req.query.patientId; // Get the patientId from the query parameters

//   const dataPath = path.join(__dirname, 'database', 'patientData.json');
//   let patient = null;

//   try {
//     const fileData = fs.readFileSync(dataPath, 'utf-8');
//     const patients = JSON.parse(fileData);
//     patient = patients.find(p => p.id === patientId);
//   } catch (error) {
//     console.error("Error reading patient data:", error);
//     return res.status(500).render('error', { message: 'Error reading patient data' });
//   }

//   if (patient) {
//     // Render the medical records page with the patient's data
//     res.render('doctor/medicalrecords', { patient });
//   } else {
//     res.status(404).render('error', { message: "Patient not found" });
//   }
// });

// Start the Server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}/home`);
});