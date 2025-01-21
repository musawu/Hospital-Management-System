# Hospital Management System

## Overview
The **Hospital Management System** is a web application framework designed to simplify the management of patient information. It provides role-based access for doctors and receptionists, ensuring secure and efficient handling of patient records.

## Prerequisites
Before running the application, ensure you have the following installed:
- **Node.js**  
- **npm** (Node Package Manager)  

## Installation

To set up the application locally, follow these steps:

1. Clone the repository to your local machine:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd APPWEBFRAMEWORK
   ```

3. Install the required dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the server using `nodemon`:
   ```bash
   nodemon index.js
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:5002/home
   ```

## User Authentication

### Doctor Login
- **Email:** doctor@gmail.com  
- **Password:** doctor123  
- **Role:** doctor  

### Receptionist Login
- **Email:** receptionist@gmail.com  
- **Password:** receptionist123  
- **Role:** receptionist  

## Features

- **Home Page:** Accessible at `/home`.  
- **Sign-In Page:** Accessible at `/signin`.  
- **Doctor Dashboard:** Accessible at `/doctor/dashboard` after logging in as a doctor.  
- **Receptionist Dashboard:** Accessible at `/receptionist/dashboard` after logging in as a receptionist.  
- **Patient Information:** Doctors can view and update patient records.  
- **Patient Registration:** Receptionists can add new patient records.  

## File Structure

The project directory is organized as follows:

- `index.js`: Main server file.  
- `views/`: Contains view templates (e.g., HTML/handlebars files).  
- `database/`: Contains JSON files for storing user and patient data.  
- `public/`: Contains static files such as CSS and JavaScript.  

## Troubleshooting

If you encounter any issues:

1. Ensure all dependencies are installed by running:
   ```bash
   npm install
   ```

2. Check if `nodemon` is installed globally. If not, install it using:
   ```bash
   npm install -g nodemon
   ```

3. Review terminal logs for error messages and resolve them accordingly.  

## Contributing

We welcome contributions!  
- Fork the repository.  
- Submit pull requests with your proposed changes.  
- For major updates, please create an issue to discuss your ideas before implementation.  

## License

This project is licensed under the **MIT License**.  

