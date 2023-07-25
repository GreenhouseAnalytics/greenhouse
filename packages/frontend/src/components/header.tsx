"use client";
import Image from "next/image";
import React, { useCallback } from "react";
import { signOut } from "next-auth/react";

import { header, nav } from "./header.css";
import { linkButton } from "./shared.css";

export default function Layout() {
  const handleSignOut = useCallback(() => signOut(), []);

  return (
    <header className={header}>
      <div className="logo">
        <Image src="/logos/dark_green.png" width="32" height="32" alt="" />
        Greenhouse
      </div>
      <nav className={nav}>
        <ul>
          <li>Explore</li>
          <li>Events</li>
          <li>Users</li>
          <li className="account">
            <button className={linkButton} onClick={handleSignOut}>
              Sign out
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
