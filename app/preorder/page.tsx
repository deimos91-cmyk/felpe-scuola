"use client";

import { Suspense } from "react";
import PreorderClient from "./preorder-client";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Caricamento…</div>}>
      <PreorderClient />
    </Suspense>
  );
}
