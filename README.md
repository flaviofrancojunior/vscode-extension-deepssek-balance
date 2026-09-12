# DeepSeek Balance

A VS Code extension that displays your **DeepSeek account balance** in the
status bar and, when clicked, shows the **balance breakdown per currency**
(available, recharged, and promotional).

![DeepSeek Balance screenshot](media/deepseek-logo.png)

## Features

- Shows the balance in the status bar (on the **right**) with the **DeepSeek
  icon** and the value in the account currency (`CN¥` for CNY, `$` for USD).
  When the account has balances in multiple currencies, they are joined with a
  separator (e.g. `CN¥110.00 · $56.00`).
- Color-coded indicator based on the balance: green (normal), amber (low), and
  red (critical), configurable.
- Clicking the indicator opens a panel with the **balance breakdown per
  currency**: total, recharged (topped up), and promotional (granted) balances,
  equivalent to the DeepSeek `/user/balance` page.
- The API key is stored securely in the operating system keychain (VS Code
  `SecretStorage`) and is never written in plain text.

## Prerequisites

- A DeepSeek **API key**, created at
  <https://platform.deepseek.com/api_keys> (format `sk-...`).
- The key is required because the balance endpoint
  (`GET https://api.deepseek.com/user/balance`) requires authentication.

## Installation and usage

1. Install the extension.
2. Open the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run
   **"DeepSeek: Set API key"**.
3. Paste your API key. It is saved to the secure keychain.
4. The balance appears in the status bar and is updated periodically.

### Available commands

| Command | Description |
| --- | --- |
| `DeepSeek: Set API key` | Configures the API key. |
| `DeepSeek: Clear API key` | Removes the stored key. |
| `DeepSeek: Show balance` | Opens the balance breakdown panel. |
| `DeepSeek: Refresh balance now` | Forces an immediate refresh. |

## Configuration

| Property | Default | Description |
| --- | --- | --- |
| `deepseek.refreshIntervalMinutes` | `15` | Interval (minutes) between checks. |
| `deepseek.lowBalanceThreshold` | `5` | Threshold (USD) for the amber balance. |
| `deepseek.criticalBalanceThreshold` | `1` | Threshold (USD) for the red balance. |

## Key security

The API key is stored in the VS Code **SecretStorage** (operating system
keychain/credential store). This **prevents technical leakage** of the key
(plain-text files, accidental Git commits, distribution inside the `.vsix`
package).

⚠️ **Important limitation:** SecretStorage does **not** prevent human leakage. If
you share the key manually, it will be exposed. Best practices:

- **Never** share your API key.
- To grant access to others, generate a separate, limited key.
- Revoke any suspicious key immediately at
  <https://platform.deepseek.com/api_keys>.

## About the balance

The balance is fetched **online** from the official endpoint
`GET https://api.deepseek.com/user/balance`, returning the account totals per
currency: **total** (granted + topped up), **recharged** (topped up), and
**promotional** (granted) balances.

> The DeepSeek API does not expose an endpoint to list usage history or
> activity; the balance endpoint provides the official account data and requires
> an API key.

## Development

```bash
npm install        # install dependencies
npm run compile    # compile TypeScript
npm test           # run unit tests
```

To debug: press `F5` (Extension Development Host).

## Publishing

```bash
npm install -g @vscode/vsce
vsce package          # generates the .vsix file
vsce publish          # publishes to the Marketplace
```

## License

MIT