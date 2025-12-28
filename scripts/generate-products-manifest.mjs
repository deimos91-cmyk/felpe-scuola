import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const productsDir = path.join(root, "public", "products");
const outputDir = path.join(root, "generated");
const outputPath = path.join(outputDir, "products-manifest.json");
const products = JSON.parse(fs.readFileSync(path.join(root, "data", "products.json"), "utf8"));

const COLOR_IMAGE_MAP = {
  "Blu-Navy": "Blue-Navy",
};

function normalizeColorForModel(modelKey, color) {
  if (modelKey === "TENERIFE") {
    return color;
  }
  return COLOR_IMAGE_MAP[color] ?? color;
}

function canonicalColor(modelKey, color) {
  return normalizeColorForModel(modelKey, color).trim().toLowerCase().replace(/[\s_]+/g, "-");
}

function manifestKey(product, color) {
  const colorKey = canonicalColor(product.modelKey, color);
  return `${product.modelKey}__${product.variant}__${colorKey}`;
}

function expectedBase(product, color) {
  if (product.modelKey === "KANGAROO" && product.variant === "kids") {
    return `${product.modelKey}-Kids-${normalizeColorForModel(product.modelKey, color)}`;
  }
  if (product.modelKey === "WHALE" && product.variant === "kids") {
    return `${product.modelKey}-Kids-${normalizeColorForModel(product.modelKey, color)}`;
  }
  return `${product.modelKey}-${normalizeColorForModel(product.modelKey, color)}`;
}

const imageFiles = fs
  .readdirSync(productsDir)
  .filter((name) => /\.(png|jpe?g|webp|svg)$/i.test(name));

const baseToActual = new Map(
  imageFiles.map((name) => {
    const base = path.parse(name).name.toLowerCase();
    return [base, name];
  }),
);

const entries = {};
const missing = [];

for (const product of products) {
  for (const color of product.colors) {
    const baseName = expectedBase(product, color);
    const key = manifestKey(product, color);
    const match = baseToActual.get(baseName.toLowerCase());
    if (match) {
      if (entries[key] && entries[key] !== `/products/${match}`) {
        throw new Error(
          `Duplicate manifest key ${key} detected with different files: ${entries[key]} vs /products/${match}`,
        );
      }
      entries[key] = `/products/${match}`;
    } else {
      missing.push({ product: product.title, modelKey: product.modelKey, variant: product.variant, color, expected: baseName });
    }
  }
}

const placeholders = {
  adult: "/products/placeholder-adult.jpg",
  kids: "/products/placeholder-kids.jpg",
  standard: "/products/placeholder-adult.jpg",
  default: "/products/placeholder-adult.jpg",
};

const missingPlaceholders = Object.values(placeholders).filter((p) =>
  !fs.existsSync(path.join(root, "public", p.replace(/^\//, ""))),
);

if (missing.length > 0 || missingPlaceholders.length > 0) {
  if (missing.length) {
    console.error("Missing product images:");
    for (const miss of missing) {
      console.error(` - ${miss.modelKey} (${miss.variant}) color "${miss.color}" expected file base "${miss.expected}"`);
    }
  }
  if (missingPlaceholders.length) {
    console.error("Missing placeholder images:", missingPlaceholders.join(", "));
  }
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  outputPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      entries,
      placeholders,
    },
    null,
    2,
  ),
);

console.log(`Wrote manifest with ${Object.keys(entries).length} entries to ${outputPath}`);
