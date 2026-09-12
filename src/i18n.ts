/**
 * Interface messages (English).
 *
 * Exposes a static dictionary of UI strings. The interface is English-only.
 */

export interface Mensagens {
  saldoTooltip: string;
  semChaveTooltip: string;
  erroTooltip: (mensagem: string) => string;
  definirChavePrompt: string;
  definirChavePlaceholder: string;
  definirChaveErroVazio: string;
  definirChaveOk: string;
  limparChaveOk: string;
  saldoTitulo: string;
  saldoSubtitulo: string;
  saldoDisponivel: string;
  saldoRecarregado: string;
  saldoConcedido: string;
  saldoErro: (mensagem: string) => string;
}

export const MENSAGENS: Mensagens = {
  saldoTooltip:
    'DeepSeek balance (click for the breakdown per currency)',
  semChaveTooltip: 'Set your DeepSeek API key (click to configure)',
  erroTooltip: (m) => `Failed to fetch: ${m}`,
  definirChavePrompt:
    'Paste your DeepSeek API key (https://platform.deepseek.com/api_keys)',
  definirChavePlaceholder: 'sk-...',
  definirChaveErroVazio: 'Key cannot be empty.',
  definirChaveOk: 'DeepSeek API key saved securely.',
  limparChaveOk: 'DeepSeek API key removed.',
  saldoTitulo: 'DeepSeek balance',
  saldoSubtitulo: 'Breakdown per currency',
  saldoDisponivel: 'Available',
  saldoRecarregado: 'Recharged',
  saldoConcedido: 'Promotional',
  saldoErro: (m) => `Could not load balance: ${m}`,
};
