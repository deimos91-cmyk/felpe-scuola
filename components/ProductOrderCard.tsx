"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "../data/products";

type Props = {
  product: Product;
};

export default function ProductOrderCard({ product }: Props) {
  const router = useRouter();
  const hasKidsImage =
    product.variant === "kids" && product.modelKey === "KANGAROO";

  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes?.[0] ?? null,
  );
  const [qty, setQty] = useState(1);
  const [usingKidsImage, setUsingKidsImage] = useState(hasKidsImage);
  const [finalFallback, setFinalFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildSrc = useMemo(
    () => (color: string, preferKids: boolean) => {
      const encodedColor = encodeURIComponent(color);
      if (preferKids && hasKidsImage) {
        return `/products/KANGAROO-Kids-${encodedColor}.jpg`;
      }
      return `/products/${product.modelKey}-${encodedColor}.jpg`;
    },
    [hasKidsImage, product.modelKey],
  );

  const [imageSrc, setImageSrc] = useState(
    buildSrc(product.colors[0], hasKidsImage),
  );

  useEffect(() => {
    setSelectedColor(product.colors[0]);
    setSelectedSize(product.sizes?.[0] ?? null);
    setUsingKidsImage(hasKidsImage);
    setFinalFallback(false);
    setImageSrc(buildSrc(product.colors[0], hasKidsImage));
  }, [buildSrc, hasKidsImage, product.colors, product.sizes]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setUsingKidsImage(hasKidsImage);
    setFinalFallback(false);
    setError(null);
    setImageSrc(buildSrc(color, hasKidsImage));
  };

  const handleImageError = () => {
    if (hasKidsImage && usingKidsImage) {
      setUsingKidsImage(false);
      setImageSrc(buildSrc(selectedColor, false));
      return;
    }

    if (!finalFallback) {
      setFinalFallback(true);
      setImageSrc("/hoodie.png");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (qty < 1) {
      setError("Quantità minima 1.");
      return;
    }

    if (product.sizes && !selectedSize) {
      setError("Seleziona una taglia.");
      return;
    }

    const params = new URLSearchParams({
      productType: product.name,
      modelKey: product.modelKey,
      variant: product.variant ?? "standard",
      color: selectedColor,
      qty: String(qty),
    });

    if (product.sizes && selectedSize) {
      params.set("size", selectedSize);
    }

    router.push(`/preorder?${params.toString()}`);
  };

  return (
    <article style={cardStyle}>
      <div style={imageShellStyle}>
        <img
          src={imageSrc}
          alt={`${product.name} - ${selectedColor}`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={handleImageError}
        />
        {product.variant ? (
          <span style={badgeStyle}>
            {product.variant === "kids"
              ? "Bambino"
              : product.variant === "adult"
                ? "Adulto"
                : "Standard"}
          </span>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 10 }}
        noValidate
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 20 }}>{product.name}</h2>
            <p style={{ margin: 0, color: "#475569" }}>{product.description}</p>
          </div>
          <strong style={{ fontSize: 18, color: "#0f172a" }}>
            €{product.price}
          </strong>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <p style={labelStyle}>Colori</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {product.colors.map((color) => {
              const active = color === selectedColor;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorChange(color)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 10,
                    border: active ? "2px solid #0f172a" : "1px solid #cbd5e1",
                    background: active ? "#e2e8f0" : "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>

        {product.sizes ? (
          <div style={{ display: "grid", gap: 6 }}>
            <p style={labelStyle}>Taglie</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {product.sizes.map((size) => {
                const active = size === selectedSize;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 10,
                      border: active ? "2px solid #0f172a" : "1px solid #cbd5e1",
                      background: active ? "#e2e8f0" : "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p style={{ margin: 0, color: "#475569" }}>Taglia unica</p>
        )}

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ ...labelStyle, margin: 0 }}>Qty</label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            style={inputStyle}
          />
        </div>

        {error ? <p style={{ color: "#dc2626", margin: 0 }}>{error}</p> : null}

        <button
          type="submit"
          style={buttonStyle}
        >
          Preordina
        </button>
      </form>
    </article>
  );
}

const cardStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 16,
  display: "grid",
  gap: 12,
  boxShadow: "0 12px 40px rgba(15,23,42,0.08)",
};

const imageShellStyle: CSSProperties = {
  position: "relative",
  borderRadius: 12,
  overflow: "hidden",
  background: "#e2e8f0",
  height: 220,
};

const badgeStyle: CSSProperties = {
  position: "absolute",
  top: 10,
  left: 10,
  background: "#0f172a",
  color: "#fff",
  padding: "6px 10px",
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 700,
};

const inputStyle: CSSProperties = {
  width: 80,
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  background: "#fff",
};

const buttonStyle: CSSProperties = {
  border: "none",
  background: "#0f172a",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 700,
  boxShadow: "0 10px 30px rgba(15,23,42,0.2)",
};

const labelStyle: CSSProperties = {
  margin: 0,
  color: "#334155",
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: 0.2,
};
