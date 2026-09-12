# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-12

### Added

- DeepSeek balance display in the status bar with the account currency
  (`CN¥` for CNY, `$` for USD) and all returned currencies joined.
- Color-coded indicator based on balance thresholds (normal/amber/red).
- Balance breakdown panel showing, per currency, the total, recharged
  (topped up), and promotional (granted) balances.
- Secure API key storage via VS Code `SecretStorage`.
- Commands to set/clear the key, show the balance, and refresh.
- Configuration for refresh interval and color thresholds.
- Unit test suite (mocha) for the DeepSeek client and formatting.

### Changed

- Converted from the OpenRouter balance extension: the API client now targets
  `GET https://api.deepseek.com/user/balance` (no public analytics endpoint
  exists on DeepSeek, so the activity panel became a balance breakdown).
- All commands, settings, and identifiers renamed from `openrouter.*` to
  `deepseek.*`.
- New DeepSeek logo assets replacing the OpenRouter ones.