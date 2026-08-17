"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm({
  defaultSubject,
  productId,
  serviceId,
}: {
  defaultSubject?: string;
  productId?: string;
  serviceId?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          product: productId,
          service: serviceId,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Something went wrong");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to send");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-steel">
          Name
          <input name="name" required className="field mt-1" />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wider text-steel">
          Email
          <input name="email" type="email" required className="field mt-1" />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wider text-steel">
          Phone
          <input name="phone" type="tel" className="field mt-1" />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wider text-steel">
          Company / Workshop
          <input name="company" className="field mt-1" />
        </label>
      </div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-steel">
        Inquiry type
        <select name="inquiryType" defaultValue="product" className="field mt-1">
          <option value="product">Product quote</option>
          <option value="sourcing">Parts sourcing</option>
          <option value="service">Technical service</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="block text-xs font-semibold uppercase tracking-wider text-steel">
        Subject
        <input
          name="subject"
          required
          defaultValue={defaultSubject}
          className="field mt-1"
        />
      </label>
      <label className="block text-xs font-semibold uppercase tracking-wider text-steel">
        Message
        <textarea name="message" required rows={5} className="field mt-1" />
      </label>
      <button type="submit" disabled={status === "loading"} className="btn-orange disabled:opacity-60">
        {status === "loading" ? "Sending…" : "Send inquiry"}
      </button>
      {status === "success" && (
        <p className="text-sm text-signal">Message received. We will reply shortly.</p>
      )}
      {status === "error" && <p className="text-sm text-orange">{error}</p>}
    </form>
  );
}
