"use client";

import { useState, useCallback } from "react";

import EventSelector from "@/components/EventSelector";
import { toolbox, result, iconHeader } from "./page.css";

export default function Home() {
  const [eventList, setEventList] = useState<string[]>([]);

  const onEventSelect = useCallback((event: string) => {
    setEventList((state) => {
      const newList = new Set<string>([...state, event]);
      return Array.from(newList);
    });
  }, []);

  return (
    <div>
      <section className={toolbox}>
        <div className={iconHeader}>
          <h1>Events</h1>
          <EventSelector onSelect={onEventSelect} />
        </div>
        <ul>
          {eventList.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <div className={result} />
    </div>
  );
}
