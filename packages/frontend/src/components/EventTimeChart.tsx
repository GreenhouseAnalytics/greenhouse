import React, { useEffect, useRef } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import dayjs from "dayjs";

import {
  TimeSeriesQueryResponse,
  TimeSeriesQuery,
} from "@/app/api/data/events/timeseries";

import * as styles from "./EventTimeChart.css";

type Props = {
  events: string[];
};
export default React.memo(function EventTimeChart({ events }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart>();

  useEffect(() => {
    if (!events.length) {
      return;
    }

    const query: TimeSeriesQuery = {
      timeWindow: {
        type: "relative",
        start: -30,
        unit: "day",
      },
      aggregateTimeUnit: "day",
      events: events.map((name) => ({ name })),
    };

    axios
      .post<TimeSeriesQueryResponse>(
        "http://localhost:3000/api/data/events/timeseries",
        { query }
      )
      .then(({ data }) => {
        const { events, scale } = data;

        if (!canvasRef.current) {
          return;
        }

        if (!chartRef.current) {
          chartRef.current = new Chart(canvasRef.current, {
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
              labels: scale.map((time, i) => {
                if (i % 2 === 0) {
                  return dayjs(time).format("MMM D");
                }
                return "";
              }),
              datasets: [],
            },
          });
        }

        // Update dataset
        chartRef.current.data.datasets = events.map((event) => ({
          label: event.name,
          data: event.data.map((i) => i.count),
          spanGaps: true,
          segment: {
            borderDash: (ctx: { p1DataIndex: number }) => {
              return ctx.p1DataIndex === scale.length - 1 ? [6, 6] : undefined;
            },
          },
        }));
        chartRef.current.update();
      });
  }, [events]);

  return <canvas ref={canvasRef} className={styles.chart} />;
});
