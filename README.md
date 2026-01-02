# AI Social Media Post Creator – Backend (Node.js + Express)

## 🔗 Links

- **Frontend Live Demo**: [https://robo-frontend-teal.vercel.app/](https://robo-frontend-teal.vercel.app/)
- **Frontend Repository**: [https://github.com/MananBagadi100/Robo-frontend](https://github.com/MananBagadi100/Robo-frontend)

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
- **express-rate-limit** (API abuse & cost protection)

---

## 🛡️ Rate Limiting & Cost Protection

To prevent API abuse and control OpenAI usage costs, the backend implements **IP-based rate limiting**.

### Policy
- **3 request every 10 min**
- Automatically blocks excessive requests
- Returns HTTP **429 – Too Many Requests**

### Why This Matters
- Prevents spam and accidental double submissions
- Protects paid OpenAI API credits
- Makes the system production-safe

This logic is handled entirely on the backend using `express-rate-limit`, so the frontend remains lightweight.

---
## ♻️ Idempotency, Prompt Caching & Concurrency Control

To avoid duplicate OpenAI calls, race conditions, and cache stampede under concurrent traffic,
the backend implements **prompt-level idempotency with status-based concurrency control**.

### How it works

- User prompts are **normalized** (lowercased, trimmed, extra spaces removed)
- The normalized prompt is **hashed**
- The hash is stored in the database with a **unique constraint**
- A row is **inserted first** with `status = in_progress`
- This row acts as a **lock** for that prompt

### Request Flow

- If a prompt hash **does not exist**:
  - A new row is inserted with `status = in_progress`
  - OpenAI API is called
  - The response is stored
  - Status is updated to `done`

- If a prompt hash **already exists**:
  - If `status = done` → cached response is returned instantly
  - If `status = in_progress` → server returns **HTTP 202 (Accepted)** and asks the client to retry after a delay

This ensures that **only one OpenAI request is ever executed per unique prompt**, even if multiple users
send the same prompt at the same time.

### ⚡ Cache Stampede Example (2 users at the same time)

If two users send the **same prompt** at nearly the same time:

- **User A** hits the server first:
  - DB has no entry → backend inserts a row with `status = in_progress`
  - OpenAI is called and generation starts

- **User B** hits the server while A is still processing:
  - DB entry already exists with `status = in_progress`
  - backend does **NOT** call OpenAI again
  - backend returns **HTTP `202 Accepted`** with a retry delay (e.g., `waitTime_in_ms: 3000`)

- After OpenAI finishes for User A:
  - backend stores the final response and updates status to `done`

- When User B retries:
  - DB now shows `status = done`
  - backend returns the cached response instantly with **HTTP `200 OK`**

✅ Result: **only ONE OpenAI call** happens, and all concurrent requests safely wait instead of stampeding the cache.
---
### 📊 Business Impact

- **~60–80% OpenAI API cost reduction** for repeated prompts (especially image generation)
- **2–5× faster responses** on cache hits (DB read vs AI call)
- Improved UX by eliminating unnecessary waiting time
- Prevents **cache stampede** by blocking duplicate OpenAI calls during concurrent requests

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
├── middleware/
│   ├── checkHash.js        # Prompt normalization + hashing (idempotency and cache stampede handling)
│   └── checkRateLimits.js  # Rate limiting before OpenAI API call
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

⚠️ If the rate limit is exceeded, the API responds with:
```json
{
  "message": "Too many requests. Please try again later."
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

# 📄 Summary (Backend)

This backend demonstrates:

✔ Clean and modular Express architecture  
✔ Secure API integration with OpenAI  
✔ Fully functional caption + hashtag + image generation  
✔ Strong separation of concerns (controllers, routes, services)  
✔ Production-ready design & deployment  
✔ Easy API testing workflow  
✔ API rate limiting to prevent abuse and control costs
✔ Idempotent request handling via prompt hashing and caching  
✔ Cost‑optimized AI usage with reduced latency and API spend  

---

## 👤 Author  
Manan Bagadi
