# EventPulse - Event Management & Ticket Booking Platform

EventPulse is a production-ready, full-stack event management and ticket booking platform designed to handle high-concurrency ticket sales efficiently.

## 🏗 Technology Stack
- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios, Firebase SDK
- **Backend:** Django, Django REST Framework (DRF)
- **Database:** SQLite (Configured as fallback for development, strict relational models implemented ready for MySQL migration).
- **Authentication:** Firebase Authentication (JWT verification with Django).

## 📂 Project Structure
```
EventPulse/
│── backend/   # Django backend application
│── frontend/  # React frontend application
└── docs/      # Documentation
```

## 🚀 Setup Instructions

### 1. Backend Setup
The backend runs on Python 3 and Django.
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt # (Or manually install django, djangorestframework, firebase-admin, etc.)

# Run migrations and populate sample data
python manage.py migrate
python manage.py populate_db

# Run the server
python manage.py runserver
```

### 2. Frontend Setup
The frontend runs on React + Vite.
```bash
cd frontend
npm install
npm run dev
```

### 3. Firebase Configuration
**Frontend:** Update `frontend/src/utils/firebase.js` with your Firebase project credentials. Ensure Firebase Email/Password Auth is enabled.

**Backend:** Go to the Firebase Console -> Project Settings -> Service Accounts, generate a new Private Key, and save it as `firebase-adminsdk.json` in the `backend/` directory. Then ensure your `backend/.env` points to it:
`FIREBASE_ADMIN_CREDENTIALS_PATH=./firebase-adminsdk.json`

---

## 🔒 Concurrency & Race Conditions Handling

One of the most critical aspects of a ticket booking platform is ensuring that two users cannot purchase the exact same "last" ticket simultaneously, leading to negative inventory. 

To solve this, EventPulse uses **Database-level locking** via Django's `select_for_update()` inside a `transaction.atomic()` block.

**Workflow inside `BookingViewSet.create`:**
1. A transaction begins.
2. The `TicketCategory` row is fetched using `select_for_update()`. This tells the database to place an exclusive write lock on that specific row until the transaction ends.
3. If User B tries to book the same tier at the exact same millisecond, their query will wait until User A's transaction completes and releases the lock.
4. The system validates `available_quantity`. If it's sufficient, it decrements the count and saves it. If not, it returns a 400 Error.
5. The transaction commits, releasing the lock.

This guarantees absolute data integrity and ensures ticket availability never drops below zero.

## 💸 Dynamic Cancellation & Refund Flow
Users can cancel their bookings via the "My Bookings" dashboard. The API enforces a time-based penalty against the event start time:
- **> 7 days before:** 5% penalty.
- **3–7 days before:** 15% penalty.
- **1–3 days before:** 30% penalty.
- **< 24 hours before:** 50% penalty.
- **Post-event:** Rejected.

Upon cancellation:
1. An atomic transaction locks the `TicketCategory` and increments the inventory.
2. The Booking status is updated to `CANCELLED`.
3. `Cancellation` and `Refund` records are generated for auditing.
