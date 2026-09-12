/**
 * HTTP client for the DeepSeek API.
 *
 * Abstracts the balance call (`GET /user/balance`), which requires an API key.
 * The key is never stored on disk in plain text; it is provided in memory by
 * the caller (from the VS Code SecretStorage).
 */

/** Balance for a single currency, as returned by `GET /user/balance`. */
export interface SaldoPorMoeda {
  /** ISO 4217 currency code, e.g. "CNY" or "USD". */
  moeda: string;
  /** Total balance in the currency (granted + topped up). */
  total: number;
  /** Promotional (granted) balance in the currency. */
  concedido: number;
  /** Recharged (topped up) balance in the currency. */
  recarregado: number;
}

/** Aggregated balance response, equivalent to the /user/balance page. */
export interface ResumoSaldo {
  /** Whether the account balance is sufficient for API calls. */
  disponivel: boolean;
  /** Balance breakdown per currency. */
  saldos: SaldoPorMoeda[];
}

export class ErroDeepSeek extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = 'ErroDeepSeek';
  }
}

const URL_BASE = 'https://api.deepseek.com';

/**
 * Queries the account balance and returns the breakdown per currency.
 *
 * @throws ErroDeepSeek on a non-successful response (401/402/403/429/5xx).
 */
export async function obterSaldos(
  chave: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ResumoSaldo> {
  const corpo = await requisitar<{
    is_available: boolean;
    balance_infos: Array<{
      currency: string;
      total_balance: string | number;
      granted_balance: string | number;
      topped_up_balance: string | number;
    }>;
  }>(`${URL_BASE}/user/balance`, 'GET', chave, fetchImpl);

  const saldos = (corpo.balance_infos ?? []).map((info) => ({
    moeda: info.currency,
    total: arredondar(paraNumero(info.total_balance)),
    concedido: arredondar(paraNumero(info.granted_balance)),
    recarregado: arredondar(paraNumero(info.topped_up_balance)),
  }));

  return {
    disponivel: corpo.is_available,
    saldos,
  };
}

async function requisitar<T>(
  url: string,
  metodo: 'GET',
  chave: string,
  fetchImpl: typeof fetch,
): Promise<T> {
  const resposta = await fetchImpl(url, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${chave}`,
      Accept: 'application/json',
    },
  });

  if (!resposta.ok) {
    throw new ErroDeepSeek(resposta.status, mensagemErro(resposta.status));
  }

  return (await resposta.json()) as T;
}

/** Converts a numeric value that the API may return as a number or string. */
function paraNumero(valor: string | number | undefined): number {
  if (valor === undefined || valor === null) {
    return 0;
  }
  const numero = typeof valor === 'string' ? Number(valor) : valor;
  return Number.isFinite(numero) ? numero : 0;
}

function mensagemErro(status: number): string {
  switch (status) {
    case 401:
      return 'Invalid or missing DeepSeek API key.';
    case 402:
      return 'Insufficient balance on the DeepSeek account.';
    case 403:
      return 'Insufficient permissions: check your DeepSeek API key.';
    case 429:
      return 'Rate limit exceeded on DeepSeek.';
    default:
      return `DeepSeek API failure (HTTP ${status}).`;
  }
}

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}