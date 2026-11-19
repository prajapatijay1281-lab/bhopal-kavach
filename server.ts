import express from "express";
import { createServer as createHttpServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function hasValidGeminiKey(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key !== "MY_GEMINI_API_KEY" && key.length > 10);
}

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  app.use(express.json({ limit: "12mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "Bhopal Kavach Command API",
      geminiConfigured: hasValidGeminiKey(),
    });
  });

  app.post("/api/verify-image", async (req, res) => {
    const { imageDataUrl, category, landmark, description, severity } = req.body ?? {};

    if (!hasValidGeminiKey()) {
      res.json({
        apiConfigured: false,
        message: "GEMINI_API_KEY is not configured; client may use local heuristic hook.",
      });
      return;
    }

    if (!imageDataUrl || typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:image/")) {
      res.status(400).json({
        apiConfigured: true,
        error: "Valid base64 image data URL is required for Gemini Vision analysis.",
      });
      return;
    }

    const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      res.status(400).json({
        apiConfigured: true,
        error: "Malformed image data URL.",
      });
      return;
    }

    const mimeType = match[1];
    const base64Data = match[2];

    try {
      const ai = getGeminiClient();
      const prompt = [
        "You are an official municipal civic-tech verification engine for Bhopal Municipal Corporation (BMC) in Madhya Pradesh, India.",
        `Citizen submitted a '${category}' incident near '${landmark || "Bhopal"}' with severity '${severity || "moderate"}'.`,
        description ? `Citizen note: "${description}"` : "",
        "Inspect the image carefully:",
        "1. Determine if the image shows genuine outdoor flood/waterlogging OR garbage/clogged storm drain evidence matching the reported category.",
        "2. Detect spam, screenshots, indoor selfies, memes, unrelated photos, or clearly staged/recycled stock imagery.",
        "3. Assign a trustScore (0-100), concise classificationTag (e.g. 'Severe Road Flooding', 'Blocked Storm Drain', 'Plastic & Solid Waste', 'Unrelated / Non-Civic Photo'), isFraudOrSpam boolean, an array of fraudFlags (empty if authentic), recommendedAction ('broadcast_alert', 'dispatch_bmc', or 'quarantine_spam'), and a 1-sentence technical summary.",
      ]
        .filter(Boolean)
        .join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              trustScore: { type: Type.INTEGER },
              classificationTag: { type: Type.STRING },
              isFraudOrSpam: { type: Type.BOOLEAN },
              fraudFlags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendedAction: { type: Type.STRING },
              summary: { type: Type.STRING },
            },
          },
        },
      });

      const rawText = (response.text ?? "{}").trim();
      const parsed = JSON.parse(rawText);
      res.json({
        apiConfigured: true,
        provider: "gemini-4-hydrogen",
        result: parsed,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gemini Vision verification failed.";
      res.status(502).json({
        apiConfigured: true,
        error: message,
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        ws: { server: httpServer },
        hmr: process.env.DISABLE_HMR === "true" ? false : { server: httpServer },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Bhopal Kavach server listening on http://localhost:${PORT}`);
  });
}

startServer();
