import React, { useRef } from "react";

export function BareApp() {
  const renderRef = useRef(0);
  renderRef.current += 1;
  console.log("🧪 BareApp render:", renderRef.current);

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>BareApp</h1>
      <p>Render count: {renderRef.current}</p>
      <p>No routes, no auth, no providers, no hooks.</p>
    </div>
  );
}
