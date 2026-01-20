"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import productsData from "../data/products.json";
import productManifestData from "../generated/products-manifest.json";

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

type ProductManifest = {
  entries: Record<string, string>;
  placeholders: Partial<Record<Variant | "default", string>>;
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

const PRODUCTS = productsData as unknown as Product[];
const productManifest = productManifestData as unknown as ProductManifest;

const COLOR_IMAGE_MAP: Record<string, string> = {
  "Blu-Navy": "Blue-Navy",
};

function normalizeColorForModel(modelKey: ModelKey, color: string) {
  if (modelKey === "TENERIFE") {
    return color;
  }
  return COLOR_IMAGE_MAP[color] ?? color;
}

function canonicalColor(modelKey: ModelKey, color: string) {
  return normalizeColorForModel(modelKey, color).trim().toLowerCase().replace(/[\s_]+/g, "-");
}

function manifestKey(modelKey: ModelKey, variant: Variant, color: string) {
  const colorKey = canonicalColor(modelKey, color);
  return `${modelKey}__${variant}__${colorKey}`;
}

function pickPlaceholder(variant: Variant) {
  if (variant === "kids") {
    return productManifest.placeholders.kids ?? "/products/placeholder-kids.jpg";
  }
  return productManifest.placeholders[variant] ?? productManifest.placeholders.default ?? "/products/placeholder-adult.jpg";
}

function buildImageSrc(product: Product, color: string) {
  const key = manifestKey(product.modelKey, product.variant, color);
  const manifestPath = productManifest.entries[key];
  if (manifestPath) {
    return manifestPath;
  }
  const placeholder = pickPlaceholder(product.variant);
  console.error("[ProductImageMissing]", {
    modelKey: product.modelKey,
    variant: product.variant,
    color,
    normalizedColor: normalizeColorForModel(product.modelKey, color),
    key,
  });
  return placeholder;
}

function fallbackImageSrc(product: Product, color: string) {
  return pickPlaceholder(product.variant);
}

export default function Page() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(140);

  useLayoutEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 768);
      if (headerRef.current) {
        const h = headerRef.current.getBoundingClientRect().height;
        setHeaderHeight(h);
        document.documentElement.style.setProperty("--banner-h", `${Math.ceil(h)}px`);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: palette.background,
        color: palette.text,
      }}
    >
      <header
        className="siteBanner"
        ref={headerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          width: "100vw",
          minWidth: "100vw",
          display: "block",
          flex: "0 0 100vw",
          background: palette.primary,
          color: "#fff",
          paddingTop: "env(safe-area-inset-top, 0px)",
          boxShadow: "0 12px 28px rgba(0,0,0,0.2)",
        }}
      >
        <div
          className="siteBannerInner"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: isMobile ? "16px 18px" : "22px 24px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            gap: isMobile ? 10 : 12,
          }}
        >
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontSize: isMobile ? 26 : 32, fontWeight: 900 }}>sosteniamo la vita con il progetto adozione a distanza -Felpe 2025/2026</div>
            <div style={{ opacity: 0.92, fontSize: isMobile ? 14 : 16 }}>
              Catalogo ordini • colori e taglie selezionabili
            </div>
          </div>
          <img
            src="/rosmini.png"
            alt="Rosmini"
            style={{
              height: isMobile ? 78 : 112,
              width: "auto",
              alignSelf: isMobile ? "flex-start" : "center",
            }}
          />
        </div>
      </header>

      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: `calc(var(--banner-h, ${headerHeight}px) + 18px) 22px 40px`,
        }}
      >
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
          <h1 style={{ margin: 0, fontSize: 30 }}>Catalogo ordini</h1>
          <p style={{ marginTop: 8, marginBottom: 0, color: palette.muted, fontSize: 17 }}>
            Seleziona colore, taglia e quantità (1–10). Poi clicca <b style={{ color: palette.text }}>ordina</b> per
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: 19 }}>FFELPA CON CAPPUCCIO E ZIP-bambino</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: palette.muted, lineHeight: 1.6 }}>
            <li>4/6 anni: torace 36,7  lunghezza 45,9  manica 40,65</li>
            <li>6/8 anni: torace 38,4  lunghezza 50,7  manica 44,85</li>
            <li>8/10 anni: torace 41,0  lunghezza 55,5  manica 49,25</li>
            <li>10/12 anni: torace 44,5  lunghezza 60,3  manica 53,85</li>
            <li>12/14 anni: torace 48,0  lunghezza 65,1  manica 58,45</li>
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
            <li>XXS: 2-4 anni • ~98-110 cm (<strong>felpe disponibili solo in blu navy</strong>)</li>
<li>XS: 5-6 anni • ~110-118 cm</li>
<li>S: 7-8 anni • ~119-128 cm</li>
<li>M: 9-10 anni • ~129-140 cm</li>
<li>L: 11-12 anni • ~141-152 cm</li>. 
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
  const [qty, setQty] = useState("1");
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
    const parsedQty = Number.parseInt(qty, 10);
    const safeQty = Number.isNaN(parsedQty) ? 1 : Math.min(10, Math.max(1, parsedQty));
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
              const nextColor = e.target.value;
              const imgColor = normalizeColorForModel(product.modelKey, nextColor);
              const finalPath = buildImageSrc(product, nextColor);
              console.log("[ProductImage]", {
                modelKey: product.modelKey,
                variant: product.variant,
                color: nextColor,
                imgColor,
                path: finalPath,
              });
              setColor(nextColor);
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
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                setQty("");
                return;
              }
              const numeric = Number.parseInt(raw, 10);
              if (Number.isNaN(numeric)) {
                return;
              }
              const clamped = Math.min(10, Math.max(1, numeric));
              setQty(String(clamped));
            }}
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
            ordina
          </button>
          <div style={{ color: palette.muted, fontSize: 15 }}>Consegna a scuola • Pagamento alla consegna</div>
        </div>
      </div>
    </div>
  );
}
