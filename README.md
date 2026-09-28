# 歷史記憶練習 v0.2.0

Chinese History practice PWA for Abby and Bonnie.

## Firebase version

- One account per student/device
- Name + 4-digit PIN student login
- Firebase Authentication keeps the same device signed in until explicit logout
- Firestore syncs progress, bookmarks, streaks, weekly score and challenges across devices
- Same 10 underlying challenge questions with independently shuffled MC choices
- Wrong-answer review still uses concept cooldown + spaced review rather than immediate repetition

## Required Firebase console setup

1. Authentication -> Sign-in method -> enable Email/Password
2. Firestore Database -> create the database in Production mode
3. Firestore -> Rules -> paste the contents of `firestore.rules` and Publish

The public Firebase web configuration in `loader.js` is expected for a browser app. Access control is enforced by Firebase Authentication and Firestore Security Rules.
