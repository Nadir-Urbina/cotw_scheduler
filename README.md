# Prophetic Rooms Scheduler - Crest of the Wave

A modern web application for scheduling 12-minute Prophetic Room sessions during the "Crest of the Wave" conference. Built with Next.js 15, Firebase, and Tailwind CSS.

## Features

### 🌟 Core Features
- **Bilingual Support**: Full English/Spanish interface
- **Real-time Updates**: Live synchronization across all users using Firebase Firestore
- **12-minute Time Slots**: Optimized scheduling with 12-minute intervals
- **Three-day Schedule**: 
  - Thursday July 10th: 3:00 PM - 6:00 PM
  - Friday July 11th: 3:00 PM - 6:00 PM  
  - Saturday July 12th: 2:00 PM - 6:00 PM
- **Responsive Design**: Beautiful UI that works on all devices
- **Form Validation**: Required fields and input validation

### 👥 Public Features
- Browse available time slots
- Book appointments with contact information
- View booking confirmations
- Cancel existing bookings

### 🔧 Staff Features
- **Admin Authentication**: Secure staff login
- **Booking Management**: View, edit, and delete all bookings
- **Data Export**: Export booking data to CSV
- **Real-time Statistics**: Live booking counts and availability
- **Comprehensive Booking Table**: See all attendee details at a glance

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Firebase Firestore (real-time NoSQL database)
- **Authentication**: Firebase Auth
- **Language**: TypeScript
- **State Management**: React hooks with custom Firebase hooks
- **Notifications**: Sonner for toast notifications

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account

### 2. Clone and Install

```bash
git clone <repository-url>
cd prophetic_rooms_scheduler
npm install
```

### 3. Firebase Setup

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database
   - Enable Authentication (Email/Password provider)

2. **Get Firebase Configuration**:
   - Go to Project Settings → General
   - Scroll down to "Your apps" section
   - Add a web app or select existing one
   - Copy the Firebase config object

3. **Environment Variables**:
   Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules

Set up these security rules in Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to schedule for all users
    match /schedule/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Authentication Setup

1. **Create Staff User**:
   - Go to Firebase Console → Authentication → Users
   - Add a new user with email ending in `@crestofthewave.org`
   - This email domain is configured for staff access

2. **Update Staff Email Domain** (Optional):
   - Edit `src/hooks/useAuth.ts` line with `isStaff` logic
   - Change email domain pattern to match your organization

### 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with Toaster
│   └── page.tsx           # Main application page
├── components/
│   ├── ui/                # shadcn/ui components
│   └── AdminPanel.tsx     # Staff admin interface
├── hooks/
│   ├── useAuth.ts         # Firebase authentication hook
│   └── useSchedule.ts     # Schedule management with Firestore
└── lib/
    └── firebase.ts        # Firebase configuration
```

## Usage

### For Conference Attendees
1. Visit the website
2. Switch language using the toggle (English/Spanish)
3. Browse available time slots across the three days
4. Click on an available (green) slot to book
5. Fill out the booking form with your details
6. Confirm your booking

### For Staff Members
1. Click "Staff members only" button
2. Log in with your `@crestofthewave.org` email
3. Access the Admin tab for:
   - View all bookings in a table format
   - Export booking data to CSV
   - Delete bookings if needed
   - Real-time statistics dashboard

## Customization

### Changing Time Slots
Edit `src/hooks/useSchedule.ts`:
- Modify `generateTimeSlots()` parameters
- Update the schedule initialization in `initializeSchedule()`

### Adding Languages
1. Add translations to the `translations` object in components
2. Update the language type and switch logic
3. Add new translation keys as needed

### Modifying Schedule Dates
Update the date objects in `src/hooks/useSchedule.ts` `translations` section.

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is created for the "Crest of the Wave" conference. Please contact the organization for usage permissions.

## Support

For technical issues or questions, please contact the development team or create an issue in the repository.
