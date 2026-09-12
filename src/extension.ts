import * as vscode from 'vscode';

import { ResumoSaldo, obterSaldos } from './deepseekApi';
import { montarHtmlErro, mostrarSaldo } from './webview';

import { formatarSaldo } from './format';
import { MENSAGENS } from './i18n';

const CHAVE_SECRET = 'deepseek.apiKey';

let itemIcono: vscode.StatusBarItem;
let itemBarra: vscode.StatusBarItem;
let timer: NodeJS.Timeout | undefined;

export function activate(contexto: vscode.ExtensionContext): void {
  itemIcono = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    101,
  );
  itemIcono.command = 'deepseek.showSaldo';
  itemIcono.text = '$(deepseek-logo)';
  itemIcono.color = new vscode.ThemeColor('statusBarItem.foreground');
  itemIcono.tooltip = MENSAGENS.saldoTooltip;
  itemIcono.show();
  contexto.subscriptions.push(itemIcono);

  itemBarra = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );

  itemBarra.command = 'deepseek.showSaldo';
  itemBarra.text = formatarSaldo(0, 'USD');
  itemBarra.tooltip = MENSAGENS.saldoTooltip;
  itemBarra.show();
  contexto.subscriptions.push(itemBarra);

  contexto.subscriptions.push(
    vscode.commands.registerCommand('deepseek.setKey', () =>
      definirChave(contexto),
    ),
  );
  contexto.subscriptions.push(
    vscode.commands.registerCommand('deepseek.clearKey', () =>
      limparChave(contexto),
    ),
  );
  contexto.subscriptions.push(
    vscode.commands.registerCommand('deepseek.showSaldo', () =>
      void abrirSaldo(contexto),
    ),
  );
  contexto.subscriptions.push(
    vscode.commands.registerCommand('deepseek.refresh', () =>
      void atualizarSaldo(contexto),
    ),
  );

  void atualizarSaldo(contexto);
  agendarAtualizacao(contexto);
}

export function deactivate(): void {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
}

async function definirChave(contexto: vscode.ExtensionContext): Promise<void> {
  const chave = await vscode.window.showInputBox({
    prompt: MENSAGENS.definirChavePrompt,
    password: true,
    ignoreFocusOut: true,
    placeHolder: MENSAGENS.definirChavePlaceholder,
    validateInput: (valor) =>
      valor.trim() ? undefined : MENSAGENS.definirChaveErroVazio,
  });

  if (!chave) {
    return;
  }

  await contexto.secrets.store(CHAVE_SECRET, chave.trim());
  vscode.window.showInformationMessage(MENSAGENS.definirChaveOk);
  await atualizarSaldo(contexto);
}

async function limparChave(contexto: vscode.ExtensionContext): Promise<void> {
  await contexto.secrets.delete(CHAVE_SECRET);
  atualizarBarraSemChave();
  vscode.window.showInformationMessage(MENSAGENS.limparChaveOk);
}

function agendarAtualizacao(contexto: vscode.ExtensionContext): void {
  const minutos = vscode.workspace
    .getConfiguration('deepseek')
    .get<number>('refreshIntervalMinutes', 15);
  timer = setInterval(() => void atualizarSaldo(contexto), minutos * 60 * 1000);
}

async function atualizarSaldo(contexto: vscode.ExtensionContext): Promise<void> {
  const chave = await contexto.secrets.get(CHAVE_SECRET);

  if (!chave) {
    atualizarBarraSemChave();
    return;
  }

  try {
    const resumo = await obterSaldos(chave);
    itemBarra.text = textoBarra(resumo);
    itemBarra.command = 'deepseek.showSaldo';
    itemBarra.tooltip = MENSAGENS.saldoTooltip;
    itemBarra.color = corDoSaldo(resumo);
    itemIcono.command = 'deepseek.showSaldo';
    itemIcono.tooltip = MENSAGENS.saldoTooltip;
  } catch (erro) {
    itemBarra.text = formatarSaldo(0, 'USD');
    itemBarra.tooltip = MENSAGENS.erroTooltip(
      erro instanceof Error ? erro.message : 'unknown error',
    );
    itemBarra.command = 'deepseek.setKey';
    itemIcono.tooltip = MENSAGENS.erroTooltip(
      erro instanceof Error ? erro.message : 'unknown error',
    );
    itemIcono.command = 'deepseek.setKey';
  }
}

function atualizarBarraSemChave(): void {
  itemBarra.text = formatarSaldo(0, 'USD');
  itemBarra.tooltip = MENSAGENS.semChaveTooltip;
  itemBarra.command = 'deepseek.setKey';
  itemIcono.tooltip = MENSAGENS.semChaveTooltip;
  itemIcono.command = 'deepseek.setKey';
}

/** Joins the balances of all returned currencies, e.g. "¥110.00 · $56.00". */
function textoBarra(resumo: ResumoSaldo): string {
  if (resumo.saldos.length === 0) {
    return formatarSaldo(0, 'USD');
  }
  return resumo.saldos
    .map((saldo) => formatarSaldo(saldo.total, saldo.moeda))
    .join(' · ');
}

function corDoSaldo(resumo: ResumoSaldo): vscode.ThemeColor | undefined {
  const config = vscode.workspace.getConfiguration('deepseek');
  const critico = config.get<number>('criticalBalanceThreshold', 1);
  const baixo = config.get<number>('lowBalanceThreshold', 5);

  const total = resumo.saldos.reduce((acc, saldo) => acc + saldo.total, 0);

  if (total <= critico) {
    return new vscode.ThemeColor('statusBarItem.errorForeground');
  }
  if (total <= baixo) {
    return new vscode.ThemeColor('statusBarItem.warningForeground');
  }
  return undefined;
}

async function abrirSaldo(contexto: vscode.ExtensionContext): Promise<void> {
  const chave = await contexto.secrets.get(CHAVE_SECRET);

  if (!chave) {
    criarPainelErro(MENSAGENS.semChaveTooltip);
    return;
  }

  try {
    const resumo = await obterSaldos(chave);
    mostrarSaldo(contexto, resumo);
  } catch (erro) {
    criarPainelErro(erro instanceof Error ? erro.message : 'unknown error');
  }
}

function criarPainelErro(mensagem: string): vscode.WebviewPanel {
  const painel = vscode.window.createWebviewPanel(
    'deepseekSaldo',
    MENSAGENS.saldoTitulo,
    vscode.ViewColumn.One,
    { enableScripts: false, localResourceRoots: [] },
  );
  painel.webview.html = montarHtmlErro(mensagem, gerarNonce());
  return painel;
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
