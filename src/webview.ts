import * as vscode from 'vscode';

import { ResumoSaldo } from './deepseekApi';
import { formatarSaldo } from './format';
import { MENSAGENS } from './i18n';

/**
 * Builds the balance panel HTML, with a nonce-based Content-Security-Policy and
 * no unsanitized dynamic content. Displays a card per currency with the total,
 * recharged, and promotional balances, equivalent to the /user/balance page.
 */
export function montarHtmlSaldo(
  resumo: ResumoSaldo,
  nonce: string,
): string {
  const cartoes = resumo.saldos
    .map(
      (saldo) => `
    <div class="cartao">
      <p class="rotulo">${escapeHtml(saldo.moeda)} · ${MENSAGENS.saldoDisponivel}</p>
      <p class="valor saldo">${formatarSaldo(saldo.total, saldo.moeda)}</p>
      <p class="detalhe">${MENSAGENS.saldoRecarregado}: ${formatarSaldo(
        saldo.recarregado,
        saldo.moeda,
      )}</p>
      <p class="detalhe">${MENSAGENS.saldoConcedido}: ${formatarSaldo(
        saldo.concedido,
        saldo.moeda,
      )}</p>
    </div>`,
    )
    .join('\n');

  const aviso = resumo.disponivel
    ? ''
    : `<p class="aviso">${escapeHtml(MENSAGENS.saldoErro('account not available for API calls'))}</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${MENSAGENS.saldoTitulo}</title>
  <style nonce="${nonce}">
    body { font-family: var(--vscode-font-family); padding: 16px; color: var(--vscode-foreground); }
    h1 { font-size: 15px; font-weight: 600; margin: 0 0 4px; }
    .subtitulo { font-size: 12px; color: var(--vscode-descriptionForeground); margin: 0 0 16px; }
    .cartoes { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .cartao { border: 1px solid var(--vscode-panel-border); border-radius: 6px; padding: 12px; }
    .rotulo { font-size: 11px; color: var(--vscode-descriptionForeground); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 6px; }
    .valor { font-size: 18px; font-weight: 600; margin: 0 0 8px; }
    .valor.saldo { color: var(--vscode-charts-green, var(--vscode-foreground)); }
    .detalhe { font-size: 12px; color: var(--vscode-descriptionForeground); margin: 2px 0; }
    .aviso { font-size: 12px; color: var(--vscode-errorForeground); margin: 12px 0 0; }
  </style>
</head>
<body>
  <h1>${MENSAGENS.saldoTitulo}</h1>
  <p class="subtitulo">${MENSAGENS.saldoSubtitulo}</p>
  <div class="cartoes">
    ${cartoes}
  </div>
  ${aviso}
</body>
</html>`;
}

/**
 * Builds the error-state panel HTML.
 */
export function montarHtmlErro(mensagem: string, nonce: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}';">
  <title>${MENSAGENS.saldoTitulo}</title>
  <style nonce="${nonce}">
    body { font-family: var(--vscode-font-family); padding: 12px 16px; color: var(--vscode-errorForeground); }
    p { font-size: 12px; }
  </style>
</head>
<body>
  <p>${MENSAGENS.saldoErro(escapeHtml(mensagem))}</p>
</body>
</html>`;
}

/**
 * Creates the balance panel and renders its content.
 */
export function mostrarSaldo(
  contexto: vscode.ExtensionContext,
  resumo: ResumoSaldo,
): void {
  const painel = vscode.window.createWebviewPanel(
    'deepseekSaldo',
    MENSAGENS.saldoTitulo,
    vscode.ViewColumn.One,
    {
      enableScripts: false,
      localResourceRoots: [],
    },
  );

  const nonce = gerarNonce();
  painel.webview.html = montarHtmlSaldo(resumo, nonce);

  void contexto;
}

function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function gerarNonce(): string {
  const bytes = new Uint8Array(16);
  const cryptoGlobal = (globalThis as { crypto?: { getRandomValues(arr: Uint8Array): void } })
    .crypto;
  if (cryptoGlobal && typeof cryptoGlobal.getRandomValues === 'function') {
    cryptoGlobal.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
