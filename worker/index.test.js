import test from "node:test";
import assert from "node:assert/strict";
import worker, { parseContact } from "./src/index.js";

const ORIGIN = "https://bare-systems.github.io";
const env = {
  EMAIL: { send: async () => ({ messageId: "test-id" }) },
  CONTACT_FROM_EMAIL: "inquiries@customdesignwindows.com",
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

test("delivers native Cloudflare Email Service message with Reply-To", async () => {
  const deliveries = [];
  const bindings = { ...env, EMAIL: { send: async email => {
    deliveries.push(email);
    return { messageId: "test-message" };
  } } };
  const resp = await worker.fetch(request("POST", sample), bindings);
  assert.equal(resp.status, 200);
  assert.deepEqual(await resp.json(), { ok: true });
  assert.equal(deliveries.length, 1);
  const email = deliveries[0];
  assert.equal(email.to, env.CONTACT_TO_EMAIL);
  assert.deepEqual(email.from, { email: env.CONTACT_FROM_EMAIL, name: "Custom Design Windows" });
  assert.equal(email.replyTo, "taylor@example.org");
  assert.ok(email.text.includes("Interested in new living room shades."));
  assert.equal(email.text.includes("ignored_tracking_id"), false);
});

test("rejects a failed Cloudflare Email Service send instead of reporting success", async () => {
  const bindings = { ...env, EMAIL: { send: async () => {
    throw Object.assign(new Error("Recipient not verified"), { code: "E_RECIPIENT_NOT_ALLOWED" });
  } } };
  const resp = await worker.fetch(request("POST", sample), bindings);
  assert.equal(resp.status, 502);
  assert.match((await resp.json()).error, /Unable to send/);
});
