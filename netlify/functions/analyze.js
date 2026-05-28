// Netlify serverless function: /api/analyze
// Receives { model, max_tokens, system, messages } from the companion,
// forwards to the Anthropic API with the secret key attached server-side,
// and returns the Anthropic response unchanged so the front-end parsing
// (data.content[].text) keeps working exactly as it did in the artifact.

exports.handler = async (event) => {
  // CORS / preflight (same-origin in practice, but harmless to allow)
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: "Server missing ANTHROPIC_API_KEY. Set it in Netlify > Site settings > Environment variables." })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  // Whitelist the fields we forward; cap max_tokens defensively.
  const body = {
    model: payload.model || "claude-sonnet-4-20250514",
    max_tokens: Math.min(payload.max_tokens || 1000, 1500),
    messages: payload.messages || []
  };
  if (payload.system) body.system = payload.system;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(body)
    });

    const text = await resp.text();
    return {
      statusCode: resp.status,
      headers: { ...cors, "Content-Type": "application/json" },
      body: text
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: cors,
      body: JSON.stringify({ error: "Upstream request failed", detail: String(err) })
    };
  }
};
