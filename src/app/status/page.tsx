"use client";
import React, { useState } from "react";
import { useScrapingHistorySummaryQuery } from "../../api/scraping-history/queries";
import Header from "../../components/header/header";

interface ScrapingHistory {
  id: number;
  startTime: string;
  endTime: string | null;
  status: string;
  createdItems: number;
  updatedItems: number;
  updatedAt: string;
  totalItems: number;
  progress: number;
}

interface ScraperSummary {
  scraper: string;
  history: ScrapingHistory[];
  currentScan: ScrapingHistory | null;
  ratePerMinute: number | null;
}

type SortDirection = 'asc' | 'desc' | null;
type SortKey = 'scraper' | 'status' | 'updatedAt' | 'ratePerMinute';

const StatusPage = () => {
  const { data: summaries = [], isLoading, error } = useScrapingHistorySummaryQuery();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [sortState, setSortState] = useState<{ key: SortKey | null; direction: SortDirection }>({
    key: null,
    direction: null,
  });

  function formatTime(lastUpdate: string) {
    const utcDate = new Date(lastUpdate);
    const offsetMinutes = new Date().getTimezoneOffset();
    const offsetMillis = -offsetMinutes * 60 * 1000;
    const doubleOffsetDate = new Date(utcDate.getTime() + offsetMillis);
    return doubleOffsetDate.toLocaleString("en-IL", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }

  const getStatusColor = (status: string) => {
    if (status === "failed") return "var(--bs-red-5)";
    if (status === "finished") return "var(--bs-green-5)";
    if (status === "in_progress") return "var(--bs-orange-5)";
    return undefined;
  };

  const handleSort = (key: SortKey) => {
    setSortState((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return { key: null, direction: null };
    });
  };

  const applySort = (items: ScraperSummary[]) => {
    if (!sortState.key || !sortState.direction) return items;

    return [...items].sort((a, b) => {
      const getValue = (item: ScraperSummary): any => {
        if (sortState.key === 'scraper') return item.scraper.toLowerCase();
        if (sortState.key === 'status') return item.history[0]?.status ?? '';
        if (sortState.key === 'updatedAt') return item.history[0]?.updatedAt ?? '';
        if (sortState.key === 'ratePerMinute') return item.ratePerMinute ?? -1;
        return '';
      };

      const aVal = getValue(a);
      const bVal = getValue(b);

      if (aVal < bVal) return sortState.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortState.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const inProgressSummaries = summaries.filter((s) => s.history[0]?.status === "in_progress");
  const otherSummaries = summaries.filter((s) => s.history[0]?.status !== "in_progress");

  const renderTable = (items: ScraperSummary[], title: string) => (
    <>
      <h2 style={{ marginTop: 32 }}>{title}</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ textAlign: "left", padding: 8 }}>#</th>
            <th
              style={{ textAlign: "left", padding: 8, cursor: "pointer" }}
              onClick={() => handleSort("scraper")}
            >
              Scraper {sortState.key === 'scraper' && (sortState.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th
              style={{ textAlign: "left", padding: 8, cursor: "pointer" }}
              onClick={() => handleSort("status")}
            >
              Last Status {sortState.key === 'status' && (sortState.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th
              style={{ textAlign: "left", padding: 8, cursor: "pointer" }}
              onClick={() => handleSort("updatedAt")}
            >
              Last Update {sortState.key === 'updatedAt' && (sortState.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th
              style={{ textAlign: "left", padding: 8, cursor: "pointer" }}
              onClick={() => handleSort("ratePerMinute")}
            >
              Last Scan Rate (items/min) {sortState.key === 'ratePerMinute' && (sortState.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((s, index) => {
            const last = s.history[0];
            return (
              <React.Fragment key={s.scraper}>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 8 }}>{index + 1}</td>
                  <td style={{ padding: 8 }}>
                    <span
                      style={{
                        cursor: "pointer",
                        color: "#1976d2",
                        textDecoration: "underline",
                      }}
                      onClick={() =>
                        setExpanded((e) => ({ ...e, [s.scraper]: !e[s.scraper] }))
                      }
                    >
                      {s.scraper}
                    </span>
                  </td>
                  <td style={{ padding: 8, color: getStatusColor(last?.status) }}>
                    {last?.status || "-"}
                  </td>
                  <td style={{ padding: 8 }}>
                    {last?.updatedAt ? formatTime(last.updatedAt) : "-"}
                  </td>
                  <td style={{ padding: 8 }}>
                    {s.ratePerMinute ? s.ratePerMinute.toFixed(2) : "-"}
                  </td>
                  <td style={{ padding: 8 }}>
                    <button
                      onClick={() =>
                        setExpanded((e) => ({ ...e, [s.scraper]: !e[s.scraper] }))
                      }
                    >
                      {expanded[s.scraper] ? "Hide" : "Show"} History
                    </button>
                  </td>
                </tr>
                {expanded[s.scraper] && (
                  <tr>
                    <td colSpan={6} style={{ background: "#fafbfc", padding: 0 }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", margin: 0 }}>
                        <thead>
                          <tr style={{ background: "#f0f0f0" }}>
                            <th style={{ textAlign: "left", padding: 6 }}>Start</th>
                            <th style={{ textAlign: "left", padding: 6 }}>End</th>
                            <th style={{ textAlign: "left", padding: 6 }}>Last Update</th>
                            <th style={{ textAlign: "left", padding: 6 }}>Status</th>
                            <th style={{ textAlign: "left", padding: 6 }}>Created</th>
                            <th style={{ textAlign: "left", padding: 6 }}>Updated</th>
                            <th style={{ textAlign: "left", padding: 6 }}>Total</th>
                            <th style={{ textAlign: "left", padding: 6 }}>Progress</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.history.map((h) => (
                            <tr key={h.id} style={{ borderBottom: "1px solid #eee" }}>
                              <td style={{ padding: 6 }}>
                                {h.startTime ? formatTime(h.startTime) : "-"}
                              </td>
                              <td style={{ padding: 6 }}>
                                {h.endTime ? formatTime(h.endTime) : "-"}
                              </td>
                              <td style={{ padding: 6 }}>
                                {h.updatedAt ? formatTime(h.updatedAt) : "-"}
                              </td>
                              <td style={{ padding: 6, color: getStatusColor(h.status) }}>
                                {h.status}
                              </td>
                              <td style={{ padding: 6 }}>{h.createdItems}</td>
                              <td style={{ padding: 6 }}>{h.updatedItems}</td>
                              <td style={{ padding: 6 }}>{h.totalItems}</td>
                              <td style={{ padding: 6 }}>{h.progress}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </>
  );

  function renderContent(){
    if (isLoading) return <div style={{ padding: 32 }}>Loading...</div>;
    if (error) return <div style={{ padding: 32, color: "red" }}>Error loading status</div>;

    return (
        <div style={{ padding: 32, paddingBottom: 80 }}>
        <h1>Status of Scrapers</h1>
        {renderTable(applySort(inProgressSummaries), "🟠 In Progress")}
        {renderTable(applySort(otherSummaries), "✅ Others")}
        </div>
    );
  }

  return (
    <>
        <Header hideGenderSwitch hideSearch />
        {renderContent()}
    </>
  )
};

export default StatusPage;