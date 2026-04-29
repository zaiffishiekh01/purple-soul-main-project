'use client';

import { useRef } from "react";

export function TestDashboardBasic() {
  const renderRef = useRef(0);
  renderRef.current += 1;
  console.log("TestDashboardBasic render:", renderRef.current);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Test Dashboard Basic</h1>
      <p>Render count: {renderRef.current}</p>
      <p>No auth, no vendor hooks, no navigation, no useEffect.</p>
    </div>
  );
}
