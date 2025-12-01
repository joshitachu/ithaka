"use client";
import React from "react";
import LoginGate from "@/components/login-gate";

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", margin: 0, background: "black" }}>
      <LoginGate />
    </div>
  );
}
