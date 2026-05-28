# Psychological Safety Companion — Netlify Deploy

This folder is ready to deploy to Netlify. The five AI-powered modes call
`/api/analyze`, which is a small serverless function that talks to Anthropic
using a secret key kept on the server (never in the browser).

## What's in here
- `index.html` ............ the companion (the whole app)
- `netlify/functions/analyze.js` ... the secure proxy to Anthropic
- `netlify.toml` .......... tells Netlify how to wire it together

## One thing you MUST do: add your API key
The site will load without it, but the AI modes won't answer until you add an
Anthropic API key as an environment variable named:

    ANTHROPIC_API_KEY

You add it inside Netlify (Site settings > Environment variables). Steps below.

## Deploy steps (GitHub + Netlify)
1. Create a new GitHub repo (web upload is fine).
2. Upload the CONTENTS of this folder to the repo root
   (so index.html sits at the top level, with the netlify/ folder beside it).
3. In Netlify: Add new site > Import an existing project > GitHub > pick the repo.
4. Leave build command blank. Publish directory: . (a single dot).
5. Deploy. It will build once and fail-soft on AI until the key is set.
6. Site settings > Environment variables > Add a variable:
       Key:   ANTHROPIC_API_KEY
       Value: (your Anthropic API key)
7. Deploys > Trigger deploy > Deploy site (so it picks up the key).
8. Open your site URL and test a mode.

## Get an Anthropic API key
console.anthropic.com > Settings > API keys > Create key. Treat it like a
password. This key is billed per use, so keep the URL semi-private if you can.
