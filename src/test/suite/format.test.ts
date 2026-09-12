import * as assert from 'assert';

import { formatarSaldo } from '../../format';

suite('format', () => {
  suite('formatarSaldo', () => {
    test('formats with the US dollar symbol and dot decimal', () => {
      assert.strictEqual(formatarSaldo(10.25, 'USD'), '$10.25');
    });

    test('formats an integer with two decimal places', () => {
      assert.strictEqual(formatarSaldo(0, 'USD'), '$0.00');
    });

    test('formats with a thousands separator', () => {
      assert.strictEqual(formatarSaldo(1234.5, 'USD'), '$1,234.50');
    });

    test('formats values with many decimals by rounding', () => {
      assert.strictEqual(formatarSaldo(1.005, 'USD'), '$1.01');
    });

    test('formats CNY with the yuan symbol', () => {
      assert.strictEqual(formatarSaldo(110, 'CNY'), 'CN¥110.00');
    });

    test('falls back to a plain value for unknown currencies', () => {
      assert.strictEqual(formatarSaldo(42.5, 'XYZ'), '42.50 XYZ');
    });
  });
});
