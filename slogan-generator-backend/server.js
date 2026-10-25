import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_URL = "http://localhost:11434/v1/chat/completions";

app.get("/generate-slogan", async (req, res) => {
  const text = req.query.text;

  if (!text) {
    return res
      .status(400)
      .json({ error: "Missing required query parameter: text" });
  }

  const body = {
    model: "qwen-copilot",
    messages: [
      {
        role: "user",
        content: `Generate a hilarious and witty slogan, given the following text: ${text}`,
      },
    ],
  };

  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      return res.status(502).json({
        error: `Ollama returned ${response.status}`,
        details: errText,
      });
    }

    const data = await response.json();
    const slogan = data?.choices?.[0]?.message?.content?.trim();

    if (!slogan) {
      return res.status(502).json({ error: "No slogan in Ollama response", data });
    }

    return res.json({ slogan });
  } catch (err) {
    return res.status(502).json({
      error: "Failed to reach Ollama",
      details: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Slogan generator backend listening on http://localhost:${PORT}`);
});
