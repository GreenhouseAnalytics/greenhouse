"use client";

import { useState, useCallback } from "react";

import EventSelector from "@/components/EventSelector";
import EventTimeChart from "@/components/EventTimeChart";
import * as styles from "./page.css";

export default function Home() {
  const [eventList, setEventList] = useState<string[]>([]);

  const onEventSelect = useCallback((event: string) => {
    setEventList((state) => {
      const newList = new Set<string>([...state, event]);
      return Array.from(newList);
    });
  }, []);

  return (
    <div className={styles.body}>
      <section className={styles.toolbox}>
        <div className={styles.iconHeader}>
          <h1>Events</h1>
          <EventSelector onSelect={onEventSelect} />
        </div>
        <ul>
          {eventList.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <div className={styles.result}>
        <EventTimeChart events={eventList} />
      </div>
    </div>
  );
}
