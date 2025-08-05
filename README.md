# Campus Technology - Unified Education Platform

Campus Technology is a comprehensive educational platform built for seamless management of attendance, assignments, quizzes, student-faculty interaction, and user profiles using modern full-stack technologies.

This system is divided into two main components:

- **Backend (Flask - Python)**
- **Frontend (React - JavaScript)**

---

## 🌐 Features

- 🔐 Face-based Login & Registration (using Dlib and image storage)
- 🧑‍🏫 Quiz and Assignment Management (create, submit, evaluate)
- 🧠 Auto Evaluation & Answer Explanation (with AI APIs)
- 🎥 Video Meetings & Announcements
- 🗣️ Discussion Boards & Feedback
- 📊 Faculty Dashboards, Leaderboards
- 👤 User Profile Management

---

## 🛠️ Tech Stack

| Layer       | Technology                            |
|------------|----------------------------------------|
| Backend     | Python, Flask, MongoDB, Dlib, OpenCV  |
| Frontend    | React.js, JSX, CSS                    |
| Database    | MongoDB (Atlas)                       |
| AI Support  | OpenAI API for explanation/evaluation |
| Face Auth   | Dlib face recognition, face_utils     |

---

## 📁 Project Structure

```bash
campusTechnology/
│
├── backend/ → Flask server and logic
│ ├── routes/ → Modular route handlers
│ │ ├── attendance/ → Face detection, dashboard
│ │ ├── auth/ → Login, registration
│ │ ├── profile/ → Profile APIs
│ │ ├── quizassign/ → Quiz & assignment logic
│ │ └── social/ → Discussion, meetings, etc.
│ ├── utils/ → Face utilities
│ ├── database.py → MongoDB connection setup
│ ├── config.py → Settings and configurations
│ ├── extensions.py → App-wide extensions
│ ├── dependencies.py → Dependency injection (if any)
│ ├── main.py → Main app entry point
│ └── requirements.txt → Backend dependencies
│
├── frontend/ → React client
│ ├── public/ → Static files
│ └── src/ → Source code (components/pages)
│ ├── auth/ → Login/Register/FaceLogin
│ ├── attendance/ → Attendance-related components
│ ├── components/ → Modular UI components
│ ├── profile/ → Profile view
│ ├── quiz/ → Quiz logic
│ ├── student/ → Student-side views
│ ├── social/ → Social interactions
│ └── services/ → API service files
│
└── .gitignore
└── README.md
```

---


## ⚙️ Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/campusTechnology.git
cd campusTechnology
```

### 2. Backend Setup (Python - Flask)
a. Create virtual environment
```bash
cd backend
python -m venv venv
venv\Scripts\activate     # Windows
# source venv/bin/activate  # macOS/Linux
```
b. Install dependencies

```bash
pip install -r requirements.txt
```

c. Add .env file
Create a .env file in the backend/ folder and paste the following (update sensitive keys before deploying):

```bash
MONGO_URI=mongo_db url
DB_NAME=edu_app
OPENAI_API_KEY=your_openai_api_key
REACT_APP_API_URL=http://localhost:8000
SECRET_KEY=supersecretkey123
```

d. Run Flask backend

```bash
python main.py
```
Flask server will run on http://localhost:8000


### 3. Frontend Setup (React)

a. Install dependencies
``` bash
cd ../frontend
npm install
```

b. Start React app
```bash
npm start
```

React app will run on http://localhost:3000 and will proxy requests to Flask

---

## 🔐 Environment Variables Explanation (Backend)

| Variable            | Description                                      |
| ------------------- | ------------------------------------------------ |
| `MONGO_URI`         | MongoDB connection URI for your Atlas cluster    |
| `DB_NAME`           | Name of the MongoDB database                     |
| `OPENAI_API_KEY`    | API Key from OpenAI (used for explanation logic) |
| `SECRET_KEY`        | Flask secret key used for sessions/auth          |

## 🔐 Environment Variables Explanation (Frontend)

| Variable            | Description                                      |
| ------------------- | ------------------------------------------------ |
| `REACT_APP_API_URL` | Base URL for API calls in React                  |

---

### 🚀 Usage Guide
Once both frontend and backend are running:

    🧍‍♂️ Register or Face Register via /register or /facelogin

    📚 Students can take quizzes, submit assignments

    👩‍🏫 Faculties can create assignments, quizzes, evaluate

    📣 Use announcements, meetings, feedback to interact

---

### 📌 Important Notes
    ⚠️ Avoid committing .env file to Git.

    ✅ Backend is modular and extendable (uses Blueprints).

    ✅ Frontend supports role-based UI for students & faculties.

    🧪 OpenAI API is used optionally — disable in production if needed.

---

### 📷 Face Authentication
    The backend uses Dlib for face recognition. To ensure compatibility:

    Pre-download required .whl file for your platform (dlib-*.whl)

    Make sure opencv-python, numpy, and face_recognition are installed

---

### 🧾 License
    This project is open-source and free to use for educational purposes.

---

## 👨‍💻 Author
### Manoj R
📧 manojraj15@hotmail.com
🌐 [Portfolio](https://manojrajgopal.github.io/portfolio/) | [GitHub](https://github.com/manojrajgopal/)

### Nandhana Jeeraj
📧 nandhanajeeraj@gmail.com

---

### 📬 Feedback or Contributions?
Feel free to fork, open issues or contribute to this project. Let's build better education tech together!

---

Let me know if you also want:
- A PDF version of this `README.md`
- Logo/banner design for your repo
- Deployment steps (Render/Netlify/etc.)
- Swagger or Postman collection for the API

Just ask!
