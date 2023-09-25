import React, { useEffect, useRef } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import dayjs from "dayjs";

import { EventOverTimeData } from "@/app/api/data/events/count/route";

import * as styles from "./EventTimeChart.css";

type Props = {
  events: string[];
};
export default React.memo(function EventTimeChart({ events }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!events.length) {
      return;
    }

    axios
      .get<EventOverTimeData>("http://localhost:3000/api/data/events/count", {
        params: { name: events[0] },
      })
      .then(({ data }) => {
        const { stats } = data;

        if (!canvasRef.current) {
          return;
        }
        new Chart(canvasRef.current, {
          type: "line",
          options: {
            responsive: true,
            plugins: {
              tooltip: {
                intersect: false,
              },
              legend: {
                display: false,
              },
            },
          },
          data: {
            labels: stats.map((row, i) => {
              if (i % 2 === 0) {
                return dayjs(row.date).format("MMM D");
              }
              return "";
            }),
            datasets: [
              {
                label: events[0],
                data: stats.map((row) => row.count),
                spanGaps: true,
                segment: {
                  borderDash: (ctx) => {
                    return ctx.p1DataIndex === stats.length - 1
                      ? [6, 6]
                      : undefined;
                  },
                },
              },
            ],
          },
        });
      });
  }, [events]);

  return <canvas ref={canvasRef} className={styles.chart} />;
});
