# SafeCircle — Notes for Production

## AI Confidentiality & Data Privacy

Currently, the AI assistant works by sending a summary of user data (posts, trackers, community feed)
to an external AI API (Gemini/Claude/etc.) server-side. While this data never touches the client
browser and external providers have data processing agreements, it still means sensitive data
(missing persons reports, community safety info) leaves your infrastructure.

### Recommendation: Self-Hosted LLM for Production

For a production deployment handling real missing persons data, consider running a local model:

- **Ollama** (https://ollama.com) — run models like Llama 3, Mistral, Gemma locally
- **LM Studio** — desktop GUI for local model hosting
- **vLLM** — high-throughput inference server for production scale

**Benefits:**
- Data never leaves your servers
- No per-token API costs at scale
- Full control over model behaviour and updates
- Compliant with GDPR, NDPR (Nigeria Data Protection Regulation), and similar frameworks

**Suggested models for this use case:**
- `llama3.2:3b` — fast, low resource, good for classification + Q&A
- `gemma2:9b` — strong reasoning, fits on a single GPU
- `mistral:7b` — good balance of speed and quality

**Integration path:**
- Ollama exposes an OpenAI-compatible API at `http://localhost:11434/v1`
- Drop-in replacement in `lib/gemini.ts` using the existing OpenAI client:
  ```ts
  new OpenAI({ baseURL: 'http://localhost:11434/v1', apiKey: 'ollama' })
  ```
- Add `OLLAMA_BASE_URL` env var and prioritise it above cloud providers in `runAI()`
