# AI Social Media Post Creator – Backend (Node.js + Express)

This is the backend service for the AI-powered Social Media Post Creator application.  
It handles API requests from the frontend, communicates with OpenAI, and returns:

- AI‑generated **caption**
- AI‑generated **hashtags**
- AI‑generated **image (Base64 PNG)**

This backend is lightweight, fast, and fully deployable (Vercel / Render / Railway / Fly.io).

---

## 🚀 Tech Stack

- **Node.js**
- **Express.js**
- **OpenAI SDK (Responses API + Image API)**
- **CORS**
- **dotenv**
- **nodemon** (local development)

---

## 📁 Folder Structure

```
backend/
│
├── controllers/
│   └── aiController.js     # AI logic (caption, hashtags, image)
│
├── routes/
│   └── aiRoutes.js         # API routes
│
├── services/
│   └── openaiService.js    # OpenAI integration
│
├── .env                    # API key + config (not tracked)
├── index.js                # Server entry point
├── package.json
└── README.md
```

---

## ⚙️ Environment Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a `.env` file

```
OPENAI_API_KEY=<your-api-key>
PROJECT_ID=<your-openai-project-id>
```

Make sure `.env` is in `.gitignore` so it never gets uploaded.

---

## ▶️ Run Backend (Local Development)

Start with nodemon (auto restarts):

```bash
npm run dev
```

Or manually:

```bash
node index.js
```

Server runs by default on:

```
http://localhost:3000
```

---

# 🧪 API Documentation

The backend exposes **1 main endpoint**:

---

## **POST** `/api/ai/generate`

### 📝 Description  
Generates:

- caption  
- hashtags  
- image (as Base64 string)

### 📥 **Request Body**

```json
{
  "prompt": "Write a birthday post for 18-year-olds with a modern vibe"
}
```

### 📤 **Response Structure**

```json
{
  "caption": "Your catchy caption here...",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "imageBase64": "<long-base64-string>"
}
```

---

## 🔍 Testing with Postman / Thunder Client

### Setup
- URL: `http://localhost:3000/api/ai/generate`
- Method: **POST**
- Body → JSON

### Example Test Body:

```json
{
  "prompt": "Make a promotional cake poster for kids birthday"
}
```

### Expected Response:
- `caption`: generated text  
- `hashtags`: array of hashtags  
- `imageBase64`: Base64 encoded PNG  
- You can paste Base64 into an online viewer or save as `image.png`

---

# 🧠 How the Backend Works (High-level)

1. Express receives a `/api/ai/generate` request  
2. Body prompt is validated  
3. `openaiService.js`:
   - Calls Responses API → caption + hashtags  
   - Calls Image API → Base64 PNG  
4. Data is returned to frontend  
5. Frontend displays caption, tags, and converts Base64 into an image

---

# 🚀 Deployment

### Suitable Platforms
- **Vercel (Serverless)**
- **Render**
- **Railway**
- **Fly.io**

### Steps (Render Example)

1. Push backend to GitHub  
2. Import repo into Render  
3. Add Environment Variables:
   ```
   OPENAI_API_KEY=xxxx
   PROJECT_ID=xxxx
   ```
4. Set Start Command:
   ```
   node index.js
   ```
5. Deploy 🎉

---

# 📄 Assignment Summary (Backend)

This backend demonstrates:

✔ Clean and modular Express architecture  
✔ Secure API integration with OpenAI  
✔ Fully functional caption + hashtag + image generation  
✔ Strong separation of concerns (controllers, routes, services)  
✔ Production-ready design & deployment  
✔ Easy API testing workflow  

---

## 👤 Author  
Manan Bagadi

