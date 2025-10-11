"use client";

import { Button } from "@/components/ui/button";

export function TestModeToggle() {
  function toggleTestMode() {
    const currentMode = localStorage.getItem("testMode") === "true";
    localStorage.setItem("testMode", (!currentMode).toString());
    window.location.reload();
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button variant="outline" size="sm" onClick={toggleTestMode}>
        {localStorage.getItem("testMode") === "true" ? "Disable" : "Enable"}{" "}
        Test Mode
      </Button>
    </div>
  );
}
