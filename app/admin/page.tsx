"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { auth, db } from "../../lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

type OrderRow = {
  id: string;
  name: string;
  className: string;
  contact: string;
  size: string;
  color: string;
  qty: number;
  notes?: string;
  status: string;
  createdAt?: Date | null;
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [onlyNew, setOnlyNew] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setOrders([]);
      }
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const mapped: OrderRow[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const createdAt =
          data.createdAt && typeof data.createdAt.toDate === "function"
            ? data.createdAt.toDate()
            : null;

        return {
          id: docSnap.id,
          name: data.name ?? "",
          className: data.className ?? "",
          contact: data.contact ?? "",
          size: data.size ?? "",
          color: data.color ?? "",
          qty: data.qty ?? 0,
          notes: data.notes ?? "",
          status: data.status ?? "new",
          createdAt,
        };
      });

      setOrders(mapped);
    });

    return unsub;
  }, [user]);

  const filteredOrders = useMemo(
    () =>
      onlyNew
        ? orders.filter((o) => (o.status ?? "new") === "new")
        : orders,
    [orders, onlyNew],
  );

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string)?.toString().trim();
    const password = (fd.get("password") as string)?.toString();

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      setAuthError("Credenziali non valide.");
    } finally {
      setAuthLoading(false);
    }
  }

  function formatDate(date?: Date | null) {
    if (!date) return "-";
    return date.toLocaleString("it-IT", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  async function markAsSeen(id: string) {
    setActionError(null);
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, "orders", id), { status: "seen" });
    } catch (err) {
      console.error(err);
      alert("Impossibile aggiornare l'ordine.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteOrder(id: string) {
    setActionError(null);
    const ok = window.confirm("Eliminare questo ordine?");
    if (!ok) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "orders", id));
    } catch (err) {
      console.error(err);
      setActionError("Impossibile eliminare l'ordine.");
      alert("Impossibile eliminare l'ordine.");
    } finally {
      setDeletingId(null);
    }
  }

  async function deleteAllOrders() {
    setActionError(null);
    const ok = window.confirm("Eliminare TUTTI gli ordini?");
    if (!ok) return;
    setDeletingAll(true);
    try {
      const snap = await getDocs(collection(db, "orders"));
      if (snap.empty) {
        return;
      }
      const batches: ReturnType<typeof writeBatch>[] = [];
      let batch = writeBatch(db);
      let count = 0;
      snap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
        count += 1;
        if (count === 450) {
          batches.push(batch);
          batch = writeBatch(db);
          count = 0;
        }
      });
      if (count > 0 || batches.length === 0) {
        batches.push(batch);
      }
      for (const b of batches) {
        await b.commit();
      }
    } catch (err) {
      console.error(err);
      setActionError("Impossibile eliminare tutti gli ordini.");
      alert("Impossibile eliminare tutti gli ordini.");
    } finally {
      setDeletingAll(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#e2e8f0",
        padding: "60px 20px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          background: "#0b1220",
          border: "1px solid #1e293b",
          borderRadius: 18,
          padding: 24,
          boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
              Admin
            </p>
            <h1 style={{ margin: 0 }}>Ordini felpe</h1>
          </div>
          {user ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={onlyNew}
                  onChange={(evt) => setOnlyNew(evt.target.checked)}
                />
                Solo nuovi
              </label>
              <button
                type="button"
                onClick={deleteAllOrders}
                disabled={deletingAll}
                style={{ ...buttonStyle, background: "#ef4444", color: "#fff" }}
              >
                {deletingAll ? "Elimino..." : "Elimina tutti"}
              </button>
              <button
                onClick={() => signOut(auth)}
                style={buttonStyle}
                type="button"
              >
                Logout
              </button>
            </div>
          ) : null}
        </header>

        {!user ? (
          <div
            style={{
              background: "#111827",
              borderRadius: 12,
              padding: 20,
              border: "1px solid #1e293b",
              maxWidth: 380,
            }}
          >
            <p style={{ marginTop: 0, color: "#cbd5e1" }}>
              Accedi con email e password.
            </p>
            <form
              onSubmit={handleLogin}
              style={{ display: "grid", gap: 12 }}
              noValidate
            >
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                style={inputStyle}
              />
              <input
                name="password"
                type="password"
                required
                placeholder="Password"
                style={inputStyle}
              />
              {authError ? (
                <p style={{ color: "#f87171", margin: 0 }}>{authError}</p>
              ) : null}
              <button
                type="submit"
                disabled={authLoading}
                style={{
                  ...buttonStyle,
                  background: "#22c55e",
                  color: "#0f172a",
                  fontWeight: 700,
                }}
              >
                {authLoading ? "Accesso..." : "Entra"}
              </button>
            </form>
          </div>
        ) : (
          <div
            style={{
              background: "#111827",
              borderRadius: 12,
              padding: 16,
              border: "1px solid #1f2937",
              overflowX: "auto",
            }}
          >
            {actionError ? (
              <p style={{ color: "#f87171", margin: "0 0 12px" }}>{actionError}</p>
            ) : null}
            {filteredOrders.length === 0 ? (
              <p style={{ margin: 0, color: "#cbd5e1" }}>Nessun ordine.</p>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  color: "#e2e8f0",
                }}
              >
                <thead>
                  <tr style={{ textAlign: "left", color: "#94a3b8" }}>
                    <th style={thStyle}>Data</th>
                    <th style={thStyle}>Nome</th>
                    <th style={thStyle}>Classe</th>
                    <th style={thStyle}>Contatto</th>
                    <th style={thStyle}>Taglia</th>
                    <th style={thStyle}>Colore</th>
                    <th style={thStyle}>Qty</th>
                    <th style={thStyle}>Note</th>
                    <th style={thStyle}>Stato</th>
                    <th style={thStyle}>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} style={{ borderTop: "1px solid #1f2937" }}>
                      <td style={tdStyle}>{formatDate(order.createdAt)}</td>
                      <td style={tdStyle}>{order.name}</td>
                      <td style={tdStyle}>{order.className}</td>
                      <td style={tdStyle}>{order.contact}</td>
                      <td style={tdStyle}>{order.size}</td>
                      <td style={tdStyle}>{order.color}</td>
                      <td style={tdStyle}>{order.qty}</td>
                      <td style={{ ...tdStyle, maxWidth: 220 }}>
                        {order.notes || "-"}
                      </td>
                      <td style={tdStyle}>{order.status || "new"}</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                          {order.status === "seen" ? (
                            <span style={{ color: "#22c55e", fontWeight: 600 }}>
                              Visto
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => markAsSeen(order.id)}
                              disabled={updatingId === order.id}
                              style={{
                                ...buttonStyle,
                                opacity: updatingId === order.id ? 0.6 : 1,
                              }}
                            >
                              {updatingId === order.id
                                ? "Aggiorno..."
                                : "Segna come visto"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteOrder(order.id)}
                            disabled={deletingId === order.id}
                            style={{
                              ...buttonStyle,
                              background: "#ef4444",
                              color: "#fff",
                              opacity: deletingId === order.id ? 0.6 : 1,
                            }}
                          >
                            {deletingId === order.id ? "Elimino..." : "Elimina"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #1f2937",
  background: "#0f172a",
  color: "#e2e8f0",
};

const buttonStyle: CSSProperties = {
  border: "none",
  background: "#1d4ed8",
  color: "#e2e8f0",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};

const thStyle: CSSProperties = {
  padding: "10px 8px",
  fontSize: 14,
  fontWeight: 600,
  borderBottom: "1px solid #1f2937",
};

const tdStyle: CSSProperties = {
  padding: "10px 8px",
  fontSize: 14,
  verticalAlign: "top",
};
