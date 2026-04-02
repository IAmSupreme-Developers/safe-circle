# SafeCircle MCP Connection Guide

The SafeCircle MCP server exposes app actions (trackers, alerts, profile) as tools that any
MCP-compatible AI assistant can call directly.

---

## Prerequisites

1. App is running locally or deployed:
   ```
   npm run dev   # http://localhost:3000
   ```

2. You have a valid user JWT. Get it from the browser console after signing in:
   ```js
   (await (await import('https://esm.sh/@supabase/supabase-js')).createClient(
     'YOUR_SUPABASE_URL', 'YOUR_ANON_KEY'
   ).auth.getSession()).data.session.access_token
   ```
   Or from the Supabase dashboard → Authentication → Users → select user → copy JWT.

3. Node.js 18+ installed.

---

## MCP Config Block (used by all clients)

Replace the placeholders, then paste this config into whichever client you're using:

```json
{
  "mcpServers": {
    "safecircle": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/safe-circle/mcp/server.mjs"],
      "env": {
        "SAFECIRCLE_API_URL": "http://localhost:3000",
        "SAFECIRCLE_TOKEN": "YOUR_USER_JWT"
      }
    }
  }
}
```

> For a deployed app replace `http://localhost:3000` with your production URL.

---

## Claude Desktop

1. Open Claude Desktop → Settings → Developer → Edit Config  
   (or open the file directly):

   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

2. Paste the MCP config block above into the file. If the file already has other servers,
   merge the `safecircle` entry into the existing `mcpServers` object.

3. Save and **restart Claude Desktop**.

4. Verify: open a new chat, click the tools icon (hammer) — you should see `safecircle` listed
   with tools like `list_trackers`, `list_alerts`, etc.

---

## Kiro (CLI)

1. Open or create `.kiro/settings/mcp.json` in your project root:

   ```bash
   mkdir -p .kiro/settings
   touch .kiro/settings/mcp.json
   ```

2. Paste the MCP config block into `.kiro/settings/mcp.json`.

3. Restart the Kiro CLI session. The `safecircle` tools will be available automatically.

---

## Cursor

1. Open Cursor → Settings → MCP (or `Cmd+Shift+P` → "Open MCP Settings").

2. Paste the MCP config block.

3. Restart Cursor. Tools appear in the AI panel under the MCP section.

---

## VS Code (GitHub Copilot / Continue)

### Continue extension
1. Open `~/.continue/config.json`.
2. Add a `mcpServers` key with the config block above.
3. Reload the window.

### GitHub Copilot (MCP preview)
1. Open `.vscode/mcp.json` in your workspace.
2. Paste the config block.
3. Reload the window.

---

## Any other MCP-compatible client

All MCP clients use the same JSON config format. The fields are:

| Field | Value |
|---|---|
| `command` | `node` |
| `args` | absolute path to `mcp/server.mjs` |
| `env.SAFECIRCLE_API_URL` | base URL of the running app |
| `env.SAFECIRCLE_TOKEN` | user JWT from Supabase Auth |

Paste the config block into wherever that client reads its MCP server list.

---

## Available Tools

Once connected, the AI can call:

| Tool | Description |
|---|---|
| `list_trackers` | List all registered trackers |
| `register_tracker` | Register a new device (label, device_id, code) |
| `toggle_tracker` | Enable or disable a tracker by ID |
| `list_alerts` | List alerts (optional limit) |
| `mark_all_alerts_read` | Mark all unread alerts as read |
| `get_profile` | Get current user profile |
| `update_profile` | Update name, phone, proximity buffer |

---

## Troubleshooting

**"spawn node ENOENT"** — Node.js not found. Use the full path:
```bash
which node   # copy the output and use it as "command"
```

**"Unauthorized"** — JWT is expired or wrong. Re-copy it from the browser/Supabase dashboard.

**Tools not showing** — Make sure the app is running before starting the AI client. The MCP
server makes live HTTP calls to `SAFECIRCLE_API_URL`.

**Path issues on Windows** — Use forward slashes or escape backslashes in the `args` path:
```json
"args": ["C:/Users/you/safe-circle/mcp/server.mjs"]
```
