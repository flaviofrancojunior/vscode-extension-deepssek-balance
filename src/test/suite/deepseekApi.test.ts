import * as assert from 'assert';

import { ErroDeepSeek, obterSaldos } from '../../deepseekApi';

function mockFetch(corpo: unknown, status = 200): typeof fetch {
  return (async () =>
    ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => corpo,
    }) as Response) as unknown as typeof fetch;
}

suite('deepseekApi', () => {
  test('mapeia as moedas e os saldos da resposta', async () => {
    const fetchImpl = mockFetch({
      is_available: true,
      balance_infos: [
        {
          currency: 'CNY',
          total_balance: '110.00',
          granted_balance: '10.00',
          topped_up_balance: '100.00',
        },
      ],
    });

    const resumo = await obterSaldos('sk-test', fetchImpl);
    assert.strictEqual(resumo.disponivel, true);
    assert.deepStrictEqual(resumo.saldos, [
      { moeda: 'CNY', total: 110, concedido: 10, recarregado: 100 },
    ]);
  });

  test('mapeia múltiplas moedas na mesma resposta', async () => {
    const fetchImpl = mockFetch({
      is_available: true,
      balance_infos: [
        {
          currency: 'CNY',
          total_balance: '110.00',
          granted_balance: '10.00',
          topped_up_balance: '100.00',
        },
        {
          currency: 'USD',
          total_balance: '56.00',
          granted_balance: '6.00',
          topped_up_balance: '50.00',
        },
      ],
    });

    const resumo = await obterSaldos('sk-test', fetchImpl);
    assert.strictEqual(resumo.saldos.length, 2);
    assert.strictEqual(resumo.saldos[0].moeda, 'CNY');
    assert.strictEqual(resumo.saldos[1].moeda, 'USD');
  });

  test('trata valores numéricos como number ou string', async () => {
    const fetchImpl = mockFetch({
      is_available: true,
      balance_infos: [
        {
          currency: 'USD',
          total_balance: 12.345,
          granted_balance: '2.25',
          topped_up_balance: 10.095,
        },
      ],
    });

    const resumo = await obterSaldos('sk-test', fetchImpl);
    assert.strictEqual(resumo.saldos[0].total, 12.35);
    assert.strictEqual(resumo.saldos[0].concedido, 2.25);
    assert.strictEqual(resumo.saldos[0].recarregado, 10.1);
  });

  test('mapeia is_available:false', async () => {
    const fetchImpl = mockFetch({
      is_available: false,
      balance_infos: [],
    });

    const resumo = await obterSaldos('sk-test', fetchImpl);
    assert.strictEqual(resumo.disponivel, false);
    assert.deepStrictEqual(resumo.saldos, []);
  });

  test('lança ErroDeepSeek em resposta 401', async () => {
    const fetchImpl = mockFetch({}, 401);

    await assert.rejects(
      () => obterSaldos('sk-test', fetchImpl),
      (erro: ErroDeepSeek) =>
        erro instanceof ErroDeepSeek &&
        erro.status === 401 &&
        /invalid/i.test(erro.message),
    );
  });

  test('lança ErroDeepSeek em resposta 429', async () => {
    const fetchImpl = mockFetch({}, 429);

    await assert.rejects(
      () => obterSaldos('sk-test', fetchImpl),
      (erro: ErroDeepSeek) =>
        erro instanceof ErroDeepSeek && erro.status === 429,
    );
  });

  test('lança ErroDeepSeek em resposta 5xx', async () => {
    const fetchImpl = mockFetch({}, 503);

    await assert.rejects(
      () => obterSaldos('sk-test', fetchImpl),
      (erro: ErroDeepSeek) =>
        erro instanceof ErroDeepSeek && erro.status === 503,
    );
  });
});