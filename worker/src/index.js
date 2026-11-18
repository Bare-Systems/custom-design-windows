// Contact API for the copied Custom Design Windows frontend.
// POST accepts the original site's LeadConnector-style formData payload.
// It does NOT forward tracking events or depend on the old provider.
const MAX_BODY_BYTES = 12_000;

function json(value, status, origin, env) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...cors(origin, env),
    },
  });
}

function allowed(origin, env) {
  const origins = String(env.ALLOWED_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean);
  return Boolean(origin && origins.includes(origin));
}

function cors(origin, env) {
  return allowed(origin, env) ? {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  } : {};
}

function clean(value, max) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max + 1);
}

function validEmail(email) {
  return email.length <= 254 && email.length >= 5 && !/[\r\n]/.test(email) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function parseContact(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid form payload.");
  }
  // Preserve the exact contract currently used by the original site's
  // external_form_submission POST; also accept a simple first-party payload.
  const raw = payload.formData && typeof payload.formData === "object"
    ? payload.formData : payload;
  const name = clean(raw.first_name ?? raw.name, 120);
  const email = clean(raw.email, 254);
  const phone = clean(raw.phone, 40);
  const service = clean(raw["contact.service_needed"] ?? raw.service_needed, 120);
  const notes = clean(raw["contact.contact_notes"] ?? raw.contact_notes ?? raw.message, 3000);
  if (name.length < 2 || name.length > 120 || /[\r\n]/.test(name) ||
    !validEmail(email) || phone.length < 5 || phone.length > 40 ||
    service.length < 1 || service.length > 120 || notes.length < 2 ||
    notes.length > 3000) {
    throw new Error("Please provide a valid name, email, phone, service, and message.");
  }
  return { name, email, phone, service, notes };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const url = new URL(request.url);
    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({ ok: true }, 200, origin, env);
    }
    if (url.pathname !== "/api/contact") {
      return json({ error: "Not found." }, 404, origin, env);
    }
    if (!allowed(origin, env)) {
      return json({ error: "Origin not allowed." }, 403, origin, env);
    }
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin, env) });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed." }, 405, origin, env);
    }
    if (!env.EMAIL || typeof env.EMAIL.send !== "function" || !env.CONTACT_FROM_EMAIL || !env.CONTACT_TO_EMAIL) {
      return json({ error: "Contact email is not configured." }, 503, origin, env);
    }

    let payload;
    try {
      const text = await request.text();
      if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
        return json({ error: "Form submission is too large." }, 413, origin, env);
      }
      payload = parseContact(JSON.parse(text));
    } catch {
      return json({ error: "Invalid contact form submission." }, 400, origin, env);
    }

    // Do not include arbitrary request metadata in the outgoing email.
    const message = [
      "New consultation inquiry via Custom Design Windows",
      "",
      "Name: " + payload.name,
      "Email: " + payload.email,
      "Phone: " + payload.phone,
      "Service needed: " + payload.service,
      "",
      "Message:",
      payload.notes,
    ].join("\n");
    const email = {
      from: { email: env.CONTACT_FROM_EMAIL, name: "Custom Design Windows" },
      to: env.CONTACT_TO_EMAIL,
      replyTo: payload.email,
      subject: "Custom Design Windows — " + payload.service.replace(/[\r\n]/g, " "),
      text: message,
    };

    try {
      // Native Cloudflare Email Service binding. Send only to our fixed inbox.
      await env.EMAIL.send(email);
      return json({ ok: true }, 200, origin, env);
    } catch {
      return json({ error: "Unable to send your message. Please try again." }, 502, origin, env);
    }
  },
};
