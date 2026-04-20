/**
 * Avatar Component - Halm System
 * This component provides a circular profile image display with a 
 * fallback mechanism for workers and safety officers.
 */

"use client";

import * as React from "react";
import { cn } from "./utils";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

/**
 * Main Avatar Container
 * Sets the circular shape and size for profile photos.
 */
function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "size-10 relative flex shrink-0 overflow-hidden rounded-full border border-slate-200",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Avatar Image
 * Renders the actual profile image from a URL.
 */
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("size-full aspect-square object-cover", className)}
      {...props}
    />
  );
}

/**
 * Avatar Fallback
 * Displays a placeholder (like initials) if the image fails to load.
 */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "size-full flex items-center justify-center rounded-full bg-slate-100 text-xs font-bold uppercase text-slate-600",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };