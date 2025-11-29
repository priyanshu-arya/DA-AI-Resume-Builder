# ATS Resume Builder AI

An intelligent resume builder that uses Google Gemini AI to tailor your resume for Job Descriptions and ATS optimization.

## Prerequisites

- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)

## Quick Start (Local Development)

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create a file named `.env` in the root directory and add your Gemini API Key:
    ```env
    API_KEY=your_gemini_api_key_here
    ```

3.  **Firebase Configuration (Optional)**
    To enable Google/LinkedIn login and cloud storage, update `firebaseConfig.ts` with your own Firebase project credentials.
    *   If skipped, you can still use **Guest Mode**, which saves data to your browser's LocalStorage.

4.  **Run the App**
    ```bash
    npm run dev
    ```
    Open your browser to `http://localhost:5173`.

## Building for Production

To create a production build:

```bash
npm run build
```

The output will be in the `dist` folder, which can be deployed to any static host (Vercel, Netlify, Firebase Hosting, etc.).
