# Ghana SME Financial Health AI

A professional, AI-powered fintech web application designed specifically for Ghanaian small business owners. This platform helps SMEs understand their financial performance, manage cash flow, and generate professional reports in both **English** and **Twi (Akan)**.

## Key Features
- **Bilingual Support**: Fully translated into English and Twi with Text-to-Speech audio playback.
- **AI Financial Assistant**: Powered by Gemini AI to explain financial ratios and risks in natural, everyday language.
- **Financial Dashboard**: Real-time charts for revenue, expenses, profit, and cash flow.
- **Ratio Analysis**: Automatic calculation of Gross Margin, Net Margin, Current Ratio, Debt-to-Equity, and more.
- **Professional Reports**: Generate and download PDF financial reports for banks and investors.
- **Voice Input**: Ask the AI assistant questions using Twi or English speech.
- **Secure Authentication**: Google OAuth and Email/Password login via Firebase.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Framer Motion.
- **Backend**: Node.js (Express) - handles AI processing and serves the frontend.
- **Database/Auth**: Firebase (Firestore & Authentication).
- **AI Engine**: Google Gemini 3.8 Flash (via @google/genai).

---

## How to Deploy to GitHub

### 1. Initialize Git & Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new).
2. Open your terminal in the project root.
3. Run the following commands:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Ghana SME Financial Health AI"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### 2. Configure Environment Variables
You must set up the following secrets in your hosting provider (e.g., Render, Railway, or GitHub Actions) or in a local `.env` file:
- `GEMINI_API_KEY`: Your Google AI Studio API key.
- `PORT`: Default is 3000.

### 3. Firebase Configuration
The application uses a `firebase-applet-config.json` file. When deploying publicly:
1. Ensure your Firebase configuration is included in the project or set up as environment variables in the frontend.
2. In the Firebase Console, add your production domain to the **Authorized Domains** list under Authentication settings.

### 4. Hosting Recommendations
Since this is a full-stack application (Express + React), we recommend:
- **Render.com**: Connect your GitHub repo, select "Web Service", and use the command `npm run dev` (for development) or `npm run build && npm start` (for production).
- **Railway.app**: Excellent for Node.js full-stack apps.
- **Vercel**: Can be used if you adapt the Express server into Vercel Serverless Functions.

---

## Ghanaian SME Local Language Support
This application is unique in its support for **Twi**, ensuring that market traders and shop owners can access high-quality financial coaching regardless of their literacy levels in English.

### AI Setup for Twi
The AI assistant is specifically prompted to communicate in "simple, natural, everyday Twi," avoiding complex financial jargon to make data actionable for everyone.

---
Created by Manasseh Ofosu - Finance Student, Ghana.
