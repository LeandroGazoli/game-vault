"use client";

import React from "react";
import dynamic from "next/dynamic";

const SpaceDustCanvas = dynamic(() => import("./SpaceDustCanvas"), {
  ssr: false,
});

export default function ClientSpaceDustCanvas() {
  return <SpaceDustCanvas />;
}
