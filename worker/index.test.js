import test from "node:test";
import assert from "node:assert/strict";
import worker, { parseContact } from "./src/index.js";

const ORIGIN = "https://bare-systems.github.io";
const env = {
  RESEND_API_KEY: "re_test_dummy",
  CONTACT_FROM_EMAIL: "Custom Design Windows <inquiries@customdesignwindows.com>",
  CONTACT_TO_EMAIL: "customdesignwindows1@gmail.com",
  ALLOWED_ORIGINS: ORIGIN + ",https://www.customdesignwindows.com",
};
const sample = {
  type: "external_form_submission",
  formData: {
    first_name: "Taylor Example",
    email: "taylor@example.org",
    phone: "954-555-0139",
    "contact.service_needed": "Solar Screen Shades",
    "contact.contact_notes": "Interested in new living room shades.",
  },
  trackingId: "ignored_tracking_id",
};
const request = (method, data, origin = ORIGIN, path = "/api/contact") =>
  new Request("https://api.customdesignwindows.com" + path, {
    method,
    headers: {
      ...(origin ? { Origin: origin } : {}),
      ...(data !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  });

test("accepts original LeadConnector-shaped payload and extracts form fields", () => {
  assert.deepEqual(parseContact(sample), {
    name: "Taylor Example",
    email: "taylor@example.org",
    phone: "954-555-0139",
    service: "Solar Screen Shades",
    notes: "Interested in new living room shades.",
  });
  assert.deepEqual(parseContact({
    name: "Taylor Example",
    email: "taylor@example.org",
    phone: "954-555-0139",
    service_needed: "Shades",
    message: "Need window coverings.",
  }).service, "Shades");
});

test("rejects missing or invalid customer fields", () => {
  for (const malformed of [null, [], {}, { formData: {} }, {
    ...sample, formData: { ...sample.formData, email: "not-an-email" },
  }, {
    ...sample, formData: { ...sample.formData, "contact.contact_notes": "" },
  }]) {
    assert.throws(() => parseContact(malformed));
  }
});

test("health endpoint is public and doesn't depend on provider secrets", async () => {
  const resp = await worker.fetch(request("GET", undefined, null, "/api/health"), {});
  assert.equal(resp.status, 200);
  assert.deepEqual(await resp.json(), { ok: true });
});

test("refuses unsupported origins and allows preflight from configured preview", async () => {
  const bad = await worker.fetch(request("POST", sample, "https://other.example"), env);
  assert.equal(bad.status, 403);
  const preflight = await worker.fetch(request("OPTIONS"), env);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), ORIGIN);
});

test("does not report success without delivery credentials", async () => {
  const resp = await worker.fetch(request("POST", sample), { ALLOWED_ORIGINS: ORIGIN });
  assert.equal(resp.status, 503);
  assert.deepEqual(await resp.json(), { error: "Contact email is not configured." });
});

test("sends a validated email through Resend and confirms 2xx", async t => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, opts) => {
    calls.push({ url, opts });
    return Response.json({ id: "email-id-123" }, { status: 200 });
  };
  t.after(() => { globalThis.fetch = originalFetch; });
  const resp = await worker.fetch(request("POST", sample), env);
  assert.equal(resp.status, 200);
  assert.deepEqual(await resp.json(), { ok: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.resend.com/emails");
  assert.equal(calls[0].opts.headers.Authorization, "Bearer re_test_dummy");
  const body = JSON.parse(calls[0].opts.body);
  assert.equal(body.to[0], env.CONTACT_TO_EMAIL);
  assert.equal(body.from, env.CONTACT_FROM_EMAIL);
  assert.equal(body.reply_to, "taylor@example.org");
  assert.ok(body.text.includes("Interested in new living room shades."));
  assert.equal(body.text.includes("ignored_tracking_id"), false);
});

test("returns 502 rather than a false success on upstream failure", async t => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ error: "Unauthorized" }, { status: 401 });
  t.after(() => { globalThis.fetch = originalFetch; });
  const resp = await worker.fetch(request("POST", sample), env);
  assert.equal(resp.status, 502);
  assert.match((await resp.json()).error, /Unable to send/);
});
