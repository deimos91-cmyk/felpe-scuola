"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Variant = "adult" | "kids" | "standard";
type ModelKey = "KANGAROO" | "WHALE" | "VOLCANO" | "TENERIFE";

type Product = {
  title: string;
  modelKey: ModelKey;
  variant: Variant;
  price: number;
  description: string;
  details: string[];
  colors: string[];
  sizes?: string[];
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

const FELPA_ADULT_COLORS = [
  "Bianco",
  "Blu-Navy",
  "Bordeaux",
  "Celeste",
  "Cream",
  "Grigio-Oxford",
  "Havana",
  "Lilla",
  "Nero",
  "Rosa-Petalo",
  "Verde-Bosco",
];

const FELPA_KIDS_COLORS = ["Bianco", "Blu", "Grigio", "Nero"];
const MAGLIETTE_COLORS = FELPA_ADULT_COLORS.filter((c) => c !== "Lilla");

const PRODUCTS: Product[] = [
  {
    title: "Felpa Adulto",
    modelKey: "KANGAROO",
    variant: "adult",
    price: 30,
    description: "Hoodie riciclata con cappuccio e tasca a marsupio.",
    details: ["Fit oversize", "Cotone e poliestere riciclati", "Peso 280 gr"],
    colors: FELPA_ADULT_COLORS,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    title: "Felpa Bambino",
    modelKey: "KANGAROO",
    variant: "kids",
    price: 30,
    description: "Hoodie riciclata per ragazzi.",
    details: ["Fit oversize", "Cotone e poliestere riciclati", "Peso 280 gr"],
    colors: FELPA_KIDS_COLORS,
    sizes: ["XS", "S", "M", "L"],
  },
  {
    title: "Maglietta Adulto",
    modelKey: "WHALE",
    variant: "adult",
    price: 18,
    description: "T-shirt biologica, taglio unisex.",
    details: ["Fit regular", "Cotone biologico", "Peso 140 gr"],
    colors: MAGLIETTE_COLORS,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    title: "Maglietta Bambino",
    modelKey: "WHALE",
    variant: "kids",
    price: 18,
    description: "T-shirt biologica per bambini.",
    details: ["Fit regular", "Cotone biologico", "Peso 140 gr"],
    colors: MAGLIETTE_COLORS,
    sizes: ["XS", "S", "M", "L"],
  },
  {
    title: "Borraccia",
    modelKey: "VOLCANO",
    variant: "standard",
    price: 14,
    description: "Borraccia termica 500 ml.",
    details: ["Acciaio inox", "Capacità 500 ml"],
    colors: ["Standard"],
  },
  {
    title: "Cappellino",
    modelKey: "TENERIFE",
    variant: "standard",
    price: 14,
    description: "Cap riciclato con visiera curva.",
    details: ["Poliestere riciclato", "Unisex, taglia unica"],
    colors: ["Nero", "Blu-Navy"],
  },
];

const COLOR_IMAGE_MAP: Record<string, string> = {
  "Blu-Navy": "Blue-Navy",
};

function normalizeColor(color: string) {
  return COLOR_IMAGE_MAP[color] ?? color;
}

function buildImageSrc(product: Product, color: string) {
  const imgColor = product.modelKey === "TENERIFE" ? color : normalizeColor(color);
  if (product.modelKey === "KANGAROO" && product.variant === "kids") {
    return `/products/KANGAROO-Kids-${imgColor}.jpg`;
  }
  return `/products/${product.modelKey}-${imgColor}.jpg`;
}

function fallbackImageSrc(product: Product, color: string) {
  const imgColor = product.modelKey === "TENERIFE" ? color : normalizeColor(color);
  if (product.modelKey === "KANGAROO" && product.variant === "kids") {
    return `/products/KANGAROO-${imgColor}.jpg`;
  }
  return "";
}

export default function Page() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: palette.background,
        color: palette.text,
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: palette.primary,
          color: "#fff",
          boxShadow: "0 12px 28px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "22px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 32, fontWeight: 900 }}>Felpe 2025/2026</div>
            <div style={{ opacity: 0.92, fontSize: 16 }}>Catalogo preordini • colori e taglie selezionabili</div>
          </div>
          <img src="/rosmini.png" alt="Rosmini" style={{ height: 112, width: "auto" }} />
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "26px 22px 40px" }}>
        <section
          style={{
            background: palette.card,
            borderRadius: 16,
            padding: "18px 20px",
            boxShadow: "0 10px 24px rgba(11, 61, 145, 0.12)",
            border: `1px solid ${palette.border}`,
            marginBottom: 18,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 30 }}>Catalogo preordini</h1>
          <p style={{ marginTop: 8, marginBottom: 0, color: palette.muted, fontSize: 17 }}>
            Seleziona colore, taglia e quantità (1–10). Poi clicca <b style={{ color: palette.text }}>Preordina</b> per
            completare su /preorder.
          </p>
        </section>

        <SizeGuide />

        <div style={{ display: "grid", gap: 18 }}>
          {PRODUCTS.map((product) => (
            <ProductCard key={`${product.modelKey}-${product.variant}`} product={product} onPreorder={(url) => router.push(url)} />
          ))}
        </div>
      </main>
    </div>
  );
}

function SizeGuide() {
  return (
    <section
      style={{
        background: "#e6f0ff",
        border: `1px solid ${palette.border}`,
        borderRadius: 14,
        padding: "16px 18px",
        marginBottom: 18,
        boxShadow: "0 8px 20px rgba(11, 61, 145, 0.12)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 24 }}>Guida alle taglie</h2>
        <span
          style={{
            fontSize: 14,
            color: palette.muted,
            background: palette.card,
            padding: "6px 10px",
            borderRadius: 999,
            border: `1px solid ${palette.border}`,
          }}
        >
          Se sei indeciso prendi una taglia in più
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginTop: 12 }}>
        <div
          style={{
            background: palette.card,
            borderRadius: 12,
            padding: "12px 14px",
            border: `1px solid ${palette.border}`,
          }}
        >
          <h3 style={{ margin: "0 0 8px 0", fontSize: 19 }}>Adulto</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: palette.muted, lineHeight: 1.6 }}>
            <li>S: 155-165 cm • vestibilità asciutta</li>
            <li>M: 165-175 cm • vestibilità regolare</li>
            <li>L: 175-185 cm • vestibilità comoda</li>
            <li>XL: 185-195 cm • vestibilità morbida</li>
            <li style={{ marginTop: 6, color: palette.text }}>Se sei indeciso prendi una taglia in più.</li>
          </ul>
        </div>
        <div
          style={{
            background: palette.card,
            borderRadius: 12,
            padding: "12px 14px",
            border: `1px solid ${palette.border}`,
          }}
        >
          <h3 style={{ margin: "0 0 8px 0", fontSize: 19 }}>Bambino</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: palette.muted, lineHeight: 1.6 }}>
            <li>XS: 5-6 anni • ~110-118 cm</li>
            <li>S: 7-8 anni • ~119-128 cm</li>
            <li>M: 9-10 anni • ~129-140 cm</li>
            <li>L: 11-12 anni • ~141-152 cm</li>
            <li style={{ marginTop: 6, color: palette.text }}>Se sei indeciso prendi una taglia in più.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  product,
  onPreorder,
}: {
  product: Product;
  onPreorder: (url: string) => void;
}) {
  const firstColor = useMemo(() => product.colors[0] ?? "", [product.colors]);
  const [color, setColor] = useState(firstColor);
  const [size, setSize] = useState(product.sizes?.[0] ?? "");
  const [qty, setQty] = useState(1);
  const [imgSrc, setImgSrc] = useState(buildImageSrc(product, firstColor));
  const [imgFailed, setImgFailed] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  useEffect(() => {
    setImgFailed(false);
    setTriedFallback(false);
    setImgSrc(buildImageSrc(product, color));
  }, [product, color]);

  const fieldStyle: React.CSSProperties = {
    background: "#fff",
    color: palette.text,
    border: `1px solid ${palette.border}`,
    borderRadius: 10,
    padding: "12px 12px",
    fontSize: 16,
  };

  function goPreorder() {
    const safeQty = Math.min(10, Math.max(1, Number(qty) || 1));
    const url =
      `/preorder?productType=${encodeURIComponent(product.title)}` +
      `&modelKey=${encodeURIComponent(product.modelKey)}` +
      `&variant=${encodeURIComponent(product.variant)}` +
      `&color=${encodeURIComponent(color)}` +
      `&qty=${encodeURIComponent(String(safeQty))}` +
      (product.sizes ? `&size=${encodeURIComponent(size)}` : "");
    onPreorder(url);
  }

  return (
    <div
      style={{
        background: palette.card,
        borderRadius: 16,
        padding: 18,
        border: `1px solid ${palette.border}`,
        boxShadow: "0 12px 26px rgba(11, 61, 145, 0.12)",
        display: "grid",
        gridTemplateColumns: "minmax(260px, 340px) 1fr",
        gap: 16,
      }}
    >
      <div>
        {!imgFailed ? (
          <img
            src={imgSrc}
            alt={product.title}
            style={{ width: "100%", height: 300, objectFit: "cover", borderRadius: 12, background: "#dfe9ff" }}
            onError={() => {
              const fb = fallbackImageSrc(product, color);
              if (fb && fb !== imgSrc) {
                setImgSrc(fb);
                return;
              }
              setImgFailed(true);
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: 300,
              borderRadius: 12,
              background: "linear-gradient(135deg, #d4e2ff, #a8c5ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: palette.text,
              fontWeight: 800,
            }}
          >
            Immagine non disponibile
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{product.title}</div>
            <div style={{ color: palette.muted, marginTop: 4 }}>{product.description}</div>
            <ul style={{ margin: "8px 0 0 18px", padding: 0, color: palette.muted, lineHeight: 1.45 }}>
              {product.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>{product.price}€</div>
        </div>

        <div style={{ display: "grid", gap: 8, marginTop: 4 }}>
          <label style={{ fontWeight: 800, fontSize: 16 }}>Colore</label>
          <select
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
            }}
            style={fieldStyle}
          >
            {product.colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {product.sizes ? (
            <>
              <label style={{ fontWeight: 800, fontSize: 16 }}>Taglia</label>
              <select value={size} onChange={(e) => setSize(e.target.value)} style={fieldStyle}>
                {product.sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </>
          ) : null}

          <label style={{ fontWeight: 800, fontSize: 16 }}>Quantità (1–10)</label>
          <input
            type="number"
            min={1}
            max={10}
            value={qty}
            onChange={(e) => setQty(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
            style={fieldStyle}
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={goPreorder}
            style={{
              background: palette.primary,
              color: "#fff",
              padding: "14px 18px",
              borderRadius: 12,
              border: "none",
              fontWeight: 900,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 10px 20px rgba(11, 61, 145, 0.2)",
            }}
          >
            Preordina
          </button>
          <div style={{ color: palette.muted, fontSize: 15 }}>Consegna a scuola • Pagamento alla consegna</div>
        </div>
      </div>
    </div>
  );
}
