"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

type OrderParams = {
  productType: string;
  modelKey: string;
  variant: string;
  color: string;
  size?: string;
  qty: number;
};

const palette = {
  primary: "#0b3d91",
  secondary: "#5dade2",
  background: "#f3f6fb",
  card: "#ffffff",
  text: "#0b1c3f",
  muted: "#365075",
  border: "#c8d4ea",
};

export default function PreorderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const order = useMemo<OrderParams>(() => {
    const params = Object.fromEntries(searchParams?.entries() ?? []);
    const qty = Math.min(10, Math.max(1, Number(params.qty) || 1));
    return {
      productType: params.productType ?? "",
      modelKey: params.modelKey ?? "",
      variant: params.variant ?? "",
      color: params.color ?? "",
      size: params.size ?? "",
      qty,
    };
  }, [searchParams]);

  const missingParams =
    !order.productType || !order.modelKey || !order.variant || !order.color || !order.qty;

  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !className.trim() || !contact.trim()) {
      setError("Compila Nome e Cognome, Classe e Telefono/Email.");
      return;
    }
    if (missingParams) {
      setError("Dati prodotto mancanti. Torna al catalogo.");
      return;
    }
    try {
      setSubmitting(true);
      await addDoc(collection(db, "orders"), {
        productType: order.productType,
        modelKey: order.modelKey,
        variant: order.variant,
        color: order.color,
        size: order.size || null,
        qty: order.qty,
        name: name.trim(),
        className: className.trim(),
        contact: contact.trim(),
        notes: notes.trim(),
        status: "new",
        createdAt: serverTimestamp(),
      });
      setDone(true);
    } catch (err) {
      console.error(err);
      setError("Errore durante il salvataggio. Riprova.");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    background: "#fff",
    color: palette.text,
    border: `1px solid ${palette.border}`,
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 16,
  };

  if (missingParams) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: palette.background,
          color: palette.text,
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            background: palette.card,
            padding: 22,
            borderRadius: 14,
            border: `1px solid ${palette.border}`,
            boxShadow: "0 10px 24px rgba(11, 61, 145, 0.12)",
            maxWidth: 480,
          }}
        >
          <h1 style={{ margin: "0 0 8px", fontSize: 26 }}>Dati mancanti</h1>
          <p style={{ margin: "0 0 14px", color: palette.muted }}>
            Non riesco a leggere il prodotto selezionato. Torna al catalogo e riprova.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: palette.primary,
              color: "#fff",
              padding: "12px 14px",
              borderRadius: 10,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Torna al catalogo
          </Link>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: palette.background,
          color: palette.text,
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            background: palette.card,
            padding: 22,
            borderRadius: 14,
            border: `1px solid ${palette.border}`,
            boxShadow: "0 10px 24px rgba(11, 61, 145, 0.12)",
            maxWidth: 520,
            textAlign: "center",
          }}
        >
          <h1 style={{ margin: "0 0 10px", fontSize: 28 }}>Ordine ricevuto!</h1>
          <p style={{ margin: "0 0 16px", color: palette.muted }}>
            Abbiamo registrato il tuo preordine. Riceverai conferma a scuola.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: palette.primary,
              color: "#fff",
              padding: "12px 14px",
              borderRadius: 10,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Torna al catalogo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: palette.background, color: palette.text }}>
      <header
        style={{
          background: palette.primary,
          color: "#fff",
          padding: "18px 24px",
          boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>Conferma preordine</div>
            <div style={{ opacity: 0.92 }}>Compila i dati e invia: consegna e pagamento a scuola.</div>
          </div>
          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 10,
              padding: "8px 12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Torna al catalogo
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 36px" }}>
        <section
          style={{
            background: palette.card,
            borderRadius: 16,
            padding: "20px 22px",
            boxShadow: "0 10px 28px rgba(11, 61, 145, 0.12)",
            border: `1px solid ${palette.border}`,
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: "0 0 10px", fontSize: 24 }}>Riepilogo</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, color: palette.muted }}>
            <div><strong style={{ color: palette.text }}>Prodotto:</strong> {order.productType}</div>
            <div><strong style={{ color: palette.text }}>Variante:</strong> {order.variant}</div>
            <div><strong style={{ color: palette.text }}>Colore:</strong> {order.color}</div>
            {order.size ? <div><strong style={{ color: palette.text }}>Taglia:</strong> {order.size}</div> : null}
            <div><strong style={{ color: palette.text }}>Quantità:</strong> {order.qty}</div>
          </div>
        </section>

        <section
          style={{
            background: palette.card,
            borderRadius: 16,
            padding: "20px 22px",
            boxShadow: "0 10px 28px rgba(11, 61, 145, 0.12)",
            border: `1px solid ${palette.border}`,
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontWeight: 800, color: palette.text }}>Nome e Cognome</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} style={fieldStyle} />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontWeight: 800, color: palette.text }}>Classe</label>
              <input required value={className} onChange={(e) => setClassName(e.target.value)} style={fieldStyle} />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontWeight: 800, color: palette.text }}>Telefono/Email</label>
              <input required value={contact} onChange={(e) => setContact(e.target.value)} style={fieldStyle} />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontWeight: 800, color: palette.text }}>Note (opzionali)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...fieldStyle, minHeight: 80, resize: "vertical" }} />
            </div>

            {error ? <div style={{ color: "#b91c1c", fontWeight: 700 }}>{error}</div> : null}

            <button
  type="submit"

              disabled={submitting}
              style={{
                background: palette.primary,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "14px 18px",
                fontWeight: 900,
                fontSize: 17,
                cursor: submitting ? "wait" : "pointer",
                boxShadow: "0 10px 22px rgba(11, 61, 145, 0.18)",
              }}
            >
              {submitting ? "Invio..." : "Conferma ordine"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
