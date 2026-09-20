import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeRawCss, scopeProfileCss } from "../sanitizeCss";

test("Higienização de CSS (sanitizeRawCss)", async (t) => {
  await t.test("deve remover tags <style> e <script>", () => {
    const malicious = "body { color: red; } </style><script>alert(1)</script>";
    const clean = sanitizeRawCss(malicious);
    assert.equal(clean.includes("</style>"), false);
    assert.equal(clean.includes("<script>"), false);
  });

  await t.test("deve bloquear @import e javascript:", () => {
    const malicious = "@import url('https://evil.com/leak.css'); a { background: javascript:alert(1); }";
    const clean = sanitizeRawCss(malicious);
    assert.equal(clean.includes("@import"), false);
    assert.equal(clean.includes("javascript:"), false);
  });
});

test("Escopo de CSS no Perfil (scopeProfileCss)", async (t) => {
  await t.test("deve prefixar seletores comuns com #profile", () => {
    const css = ".profile-hero { border-color: gold; } .vault-card { background: black; }";
    const scoped = scopeProfileCss(css, "#profile");
    assert.ok(scoped.includes("#profile .profile-hero"));
    assert.ok(scoped.includes("#profile .vault-card"));
  });

  await t.test("deve substituir :root ou body pelo escopo do perfil", () => {
    const css = ":root { --accent: #00e5ff; } body { font-weight: bold; }";
    const scoped = scopeProfileCss(css, "#profile");
    assert.ok(scoped.includes("#profile { --accent: #00e5ff; }"));
    assert.ok(scoped.includes("#profile { font-weight: bold; }"));
    assert.equal(scoped.includes("body {"), false);
  });

  await t.test("não deve duplicar o prefixo se já estiver presente", () => {
    const css = "#profile .profile-hero { opacity: 0.9; }";
    const scoped = scopeProfileCss(css, "#profile");
    assert.equal((scoped.match(/#profile/g) || []).length, 1);
  });
});
