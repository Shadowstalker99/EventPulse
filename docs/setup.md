# EventPulse Setup & Database Instructions

## 1. Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL Server running on port 3306

## 2. MySQL Database Setup
Open your MySQL terminal or client and run the following commands to create the database and user:

```sql
CREATE DATABASE eventpulse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'root'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON eventpulse.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```
*(Adjust the user/password in `backend/.env` if your MySQL configuration differs).*

## 3. Backend Setup
Navigate to the `EventPulse/backend` directory and run the migrations to generate the schema:

```bash
cd EventPulse/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt # (Dependencies are already installed in this env)
python manage.py makemigrations
python manage.py migrate
```

## 4. Frontend Setup
Navigate to the `EventPulse/frontend` directory to start the React application:

```bash
cd EventPulse/frontend
npm install
npm run dev
```
