/**
 * Tabs Component - Halm Safety System
 * Fixed import error by removing version suffix from the library path.
 * Optimized spacing and padding for the navigation list to ensure professional look.
 */

"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs"; 

import { cn } from "./utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-11 w-fit items-center justify-center rounded-xl border border-slate-200 bg-slate-100/80 p-1 text-slate-500 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "transition-all data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm",
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-6 py-2 text-sm font-semibold",
        "outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("mt-2 flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };