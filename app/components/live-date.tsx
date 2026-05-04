"use client";

import { useEffect, useState } from "react";

export function LiveDate() {
  const [today, setToday] = useState<string>("");

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  return (
    <time
      suppressHydrationWarning
      className="block mt-3 text-xs text-stone-400 font-mono tabular-nums"
    >
      {today || " "}
    </time>
  );
}
