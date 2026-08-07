"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DateRangePicker({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [fromValue, setFromValue] = useState(from);
  const [toValue, setToValue] = useState(to);

  function apply() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", fromValue);
    params.set("to", toValue);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="report-from">From</Label>
        <Input
          id="report-from"
          type="date"
          value={fromValue}
          onChange={(e) => setFromValue(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="report-to">To</Label>
        <Input
          id="report-to"
          type="date"
          value={toValue}
          onChange={(e) => setToValue(e.target.value)}
        />
      </div>
      <Button size="sm" onClick={apply}>
        Apply
      </Button>
    </div>
  );
}
