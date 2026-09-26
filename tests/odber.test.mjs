// Odber — čistá logika (src/lib/odber.ts), bez siete.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kanal, mailtoFallback, normalizujEmail, normalizujZdroj, parsujVstup, resendRequest, webhookPayload } from '../src/lib/odber.ts';

test('e-mail: normalizácia a odmietnutie nezmyslov', () => {
  assert.equal(normalizujEmail('  Adam@Xvadur.com '), 'adam@xvadur.com');
  assert.equal(normalizujEmail('jana.novakova@sub.priklad.sk'), 'jana.novakova@sub.priklad.sk');
  for (const zle of ['', 'adam', 'adam@', '@xvadur.com', 'a b@x.sk', 'adam@localhost', 'adam@x..sk', 42, null, 'a'.repeat(300) + '@x.sk']) {
    assert.equal(normalizujEmail(zle), null, String(zle));
  }
});

test('zdroj: len bezpečné znaky, default „web“', () => {
  assert.equal(normalizujZdroj('domov'), 'domov');
  assert.equal(normalizujZdroj('hry/skrtaci-test'), 'hry/skrtaci-test');
  assert.equal(normalizujZdroj('<script>alert(1)</script>'), 'scriptalert1/script');
  assert.equal(normalizujZdroj(undefined), 'web');
  assert.equal(normalizujZdroj('x'.repeat(100)).length, 40);
});

test('parsujVstup: objekt, e-mail, honeypot', () => {
  assert.deepEqual(parsujVstup(null), { ok: false, chyba: 'Pošli JSON objekt s poľom „email“.', status: 400 });
  assert.equal(parsujVstup([]).ok, false);
  assert.equal(parsujVstup({ email: 'nie' }).ok, false);
  const ok = parsujVstup({ email: 'A@B.sk', zdroj: 'domov' });
  assert.deepEqual(ok, { ok: true, vstup: { email: 'a@b.sk', zdroj: 'domov' }, bot: false });
  const bot = parsujVstup({ email: 'a@b.sk', web: 'http://spam' });
  assert.equal(bot.ok && bot.bot, true);
});

test('payloady: webhook a Resend', () => {
  const v = { email: 'a@b.sk', zdroj: 'domov' };
  assert.deepEqual(webhookPayload(v, '2026-09-26T10:00:00.000Z'), {
    typ: 'odber',
    web: 'xvadur.com',
    email: 'a@b.sk',
    zdroj: 'domov',
    cas: '2026-09-26T10:00:00.000Z',
  });
  const r1 = resendRequest(v, { RESEND_API_KEY: 're_x' });
  assert.equal(r1.url, 'https://api.resend.com/contacts');
  assert.equal(r1.init.method, 'POST');
  assert.equal(JSON.parse(String(r1.init.body)).email, 'a@b.sk');
  const r2 = resendRequest(v, { RESEND_API_KEY: 're_x', RESEND_AUDIENCE_ID: 'aud 1' });
  assert.equal(r2.url, 'https://api.resend.com/audiences/aud%201/contacts');
});

test('kanál podľa env + mailto fallback', () => {
  assert.equal(kanal({}), 'nic');
  assert.equal(kanal({ ODBER_WEBHOOK_URL: 'http://nie-https' }), 'nic');
  assert.equal(kanal({ ODBER_WEBHOOK_URL: 'https://n8n.priklad.sk/webhook/odber' }), 'webhook');
  assert.equal(kanal({ RESEND_API_KEY: 're_x' }), 'resend');
  assert.equal(kanal({ ODBER_WEBHOOK_URL: 'https://x.sk/w', RESEND_API_KEY: 're_x' }), 'webhook');
  const m = mailtoFallback('a@b.sk');
  assert.ok(m.startsWith('mailto:adam@xvadur.com?subject='));
  assert.ok(decodeURIComponent(m).includes('a@b.sk'));
});
