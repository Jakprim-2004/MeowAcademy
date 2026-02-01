# 🐱 MeowAcademy Re-Design

Web application for loan and debt management "MeowAcademy" (กยศ. Connect Redesign).
Built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## 🚀 Features
- **User Registration**: Register with LINE Login
- **Order Management**: Create orders for service hours
- **Payment System**: QR Code generation and slip verification (Slip2Go)
- **Admin Dashboard**: Manage orders, view stats, and notify customers
- **LINE Integration**: Automated notifications and chat interactions

## 🛠 Tech Stack
- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Database**: Supabase (PostgreSQL)
- **Backend**: Supabase Edge Functions (Deno)
- **Deployment**: Vercel / Supabase Hosting

---

## ⚙️ Setup & Installation

### 1. Clone & Install
```bash
git clone <repository-url>
cd meow-loan-re-design
npm install
```

### 2. Environment Variables (.env)
Create a `.env` file in the root directory and add the following:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_URL_WEB="https://meow-loan.com"  # URL ของเว็บไซต์จริง (หรือ localhost สำหรับ dev)
```

### 3. Run Locally
```bash
npm run dev
```

---

## ☁️ Supabase Edge Functions

This project uses Supabase Edge Functions for backend logic (LINE Webhook, Notifications, etc.).

### 1. Prerequisites
- Install [Supabase CLI](https://supabase.com/docs/guides/cli)
- Login to Supabase: `npx supabase login`

### 2. Set Secrets (Required)
You must set these secrets in your Supabase project for the functions to work correctly.

**Use the command:**
```bash
npx supabase secrets set --env-file .env NAME=VALUE
```
**Or set individually:**
```bash
npx supabase secrets set LINE_MESSAGING_CHANNEL_ACCESS_TOKEN=...
```

#### List of Required Secrets:
| Secret Name | Description |
|---|---|
| `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` | Access Token from LINE Developers Console |
| `LINE_MESSAGING_CHANNEL_SECRET` | Channel Secret form LINE Developers Console |
| `LINE_ADMIN_USER_ID` | **User ID of the Admin** (starts with 'U...') to receive notifications |
| `VITE_URL_WEB` | The base URL of your website (e.g., https://meow-loan.com) |
| `SLIP2GO_SECRET_KEY` | API Key for Slip2Go (Slip Verification) |
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key (Keep this safe!) |
| `LINE_LOGIN_CHANNEL_ID` | Channel ID for LINE Login |
| `LINE_LOGIN_CHANNEL_SECRET` | Channel Secret for LINE Login |

### 3. Deploy Functions
To deploy all functions (including updates to LINE Notify):
```bash
npx supabase functions deploy --no-verify-jwt
```
Or deploy specific functions:
```bash
npx supabase functions deploy line-notify --no-verify-jwt
npx supabase functions deploy line-webhook --no-verify-jwt
```

---

## 📂 Project Structure
```
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Application pages (Register, Dashboard, Login)
│   ├── integrations/  # Supabase client & types
│   └── ...
├── supabase/
│   ├── functions/     # Deno Edge Functions
│   │   ├── line-notify/    # Notification logic
│   │   ├── line-webhook/   # Chatbot & Slip verification logic
│   │   └── ...
│   └── ...
└── ...
```

## 📝 License
This project is for educational and research purposes only. It may not be used for any other purpose.
