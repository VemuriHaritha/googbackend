import express from "express";
import cors from "cors";
import { GoogleAuth } from "google-auth-library";
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_MODEL = "gemini-2.5-pro";
const LOCATION = "us-central1";

console.log("Using credentials:", process.env.GOOGLE_APPLICATION_CREDENTIALS);


app.post("/api/assist", async (req, res) => {
  try {
    const { userText } = req.body;

    const auth = new GoogleAuth({
      scopes: "https://www.googleapis.com/auth/cloud-platform",
    });
    const client = await auth.getClient();
    const projectId = await auth.getProjectId();

    const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${LOCATION}/publishers/google/models/${GEMINI_MODEL}:generateContent`;

    const response = await client.request({
      url,
      method: "POST",
      data: {
        contents: [{ role: "user", parts: [{ text: userText }] }],
      },
    });

    const reply = response.data.candidates[0].content.parts[0].text;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini call failed" });
  }
});

app.listen(8080, () => console.log("Backend running on port 8080"));