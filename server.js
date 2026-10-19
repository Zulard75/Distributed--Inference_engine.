
import express from "express";

const app = express();
const PORT = 3000;
const LLM_URL = process.env.LLM_URL || "http://127.0.0.1:8080";

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "distributed-inference-api"
  });
});

app.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: "Prompt is required"
    });
  }

  try {
    const response = await fetch(
      `${LLM_URL}/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 128,
          temperature: 0.7,
          stream: false
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json({
      response: data.choices?.[0]?.message?.content
    });
  } catch (error) {
    res.status(502).json({
      error: "Could not connect to llama.cpp server",
      details: error.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running at http://localhost:${PORT}`);
});
