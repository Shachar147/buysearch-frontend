"use client";
import React, { useState } from "react";
import { useScrapingHistorySummaryQuery } from "../../api/scraping-history/queries";
import Header from "../../components/header/header";
import AdminGuard from "../../components/admin-guard";

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
  ratePerMinute: number | null;
}

interface ScraperSummary {
  scraper: string;
  history: ScrapingHistory[];
  currentScan: ScrapingHistory | null;
  ratePerMinute: number | null;
}

type SortDirection = 'asc' | 'desc' | null;
type SortKey = 'scraper' | 'status' | 'updatedAt' | 'ratePerMinute' | 'scannedItems' | 'startTime' | 'eta';

const StatusPage = () => {
  const { data: summaries = [], isLoading, error } = useScrapingHistorySummaryQuery();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // Default main sort: updatedAt desc
  const [sortState, setSortState] = useState<{ key: SortKey | null; direction: SortDirection }>({
    key: 'updatedAt',
    direction: 'desc',
  });
  // Add per-scraper sub-table sort state, default to updatedAt desc on first expand
  const [subSortState, setSubSortState] = useState<Record<string, { key: string | null; direction: SortDirection }>>({});

  function formatTime(lastUpdate: string) {
    const utcDate = new Date(lastUpdate);
    const offsetMinutes = new Date().getTimezoneOffset();
    const offsetMillis = -offsetMinutes * 60 * 1000;
    const doubleOffsetDate = new Date(utcDate.getTime() + offsetMillis);
    return doubleOffsetDate.toLocaleString("en-IL", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }

  function getRunTime(startTime: string, endTime: string | null) {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    let diff = Math.max(0, end - start) / 1000; // seconds
    return diff;
  }

  // Add helper to format run time
  function formatRunTime(startTime: string, endTime: string | null) {
    if (!startTime) return '-';
    let diff = getRunTime(startTime, endTime);
    const h = Math.floor(diff / 3600);
    diff -= h * 3600;
    const m = Math.floor(diff / 60);
    const s = Math.floor(diff - m * 60);
    let str = '';
    if (h > 0) str += `${h}h `;
    if (m > 0 || h > 0) str += `${m}m `;
    str += `${s}s`;
    return str.trim();
  }
  // Add helper to format time ago
  function formatTimeAgo(dateStr: string) {
    if (!dateStr) return '';
    const now = Date.now();

    const offsetMinutes = new Date().getTimezoneOffset();
    const offsetMillis = -offsetMinutes * 60 * 1000;

    const then = new Date(dateStr).getTime() + offsetMillis;
    const diff = Math.max(0, now - then) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
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
        if (sortState.key === 'status') {
            return `${item.history[0]?.status?.replace('_', ' ') ?? ''}${item.history[0]?.progress}`;
        };
        if (sortState.key === 'updatedAt') return new Date(item.history[0]?.updatedAt ?? '').getTime();
        if (sortState.key === 'startTime') {

            if (!item.history[0]?.startTime) return '-';
            const start = new Date(item.history[0]?.startTime).getTime();
            const end = item.history[0]?.endTime ? new Date(item.history[0]?.endTime).getTime() : Date.now();
            let diff = Math.max(0, end - start) / 1000; // seconds
            return diff;
        }
        if (sortState.key === 'eta') return getEta(item.history[0]);
        if (sortState.key === 'ratePerMinute') return item.ratePerMinute ? Number(item.ratePerMinute) : -1;
        if (sortState.key === 'scannedItems') return (item.history[0]?.createdItems ?? 0) + (item.history[0]?.updatedItems ?? 0);
        return '';
      };

      const aVal = getValue(a);
      const bVal = getValue(b);

      if (aVal < bVal) return sortState.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortState.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Sub-table sort handler
  const handleSubSort = (scraper: string, key: string) => {
    setSubSortState((prev) => {
      const prevState = prev[scraper] || { key: null, direction: null };
      if (prevState.key !== key) return { ...prev, [scraper]: { key, direction: 'asc' } };
      if (prevState.direction === 'asc') return { ...prev, [scraper]: { key, direction: 'desc' } };
      return { ...prev, [scraper]: { key: null, direction: null } };
    });
  };

  // Sub-table sort function
  const applySubSort = (scraper: string, items: ScrapingHistory[]) => {
    const state = subSortState[scraper];
    if (!state || !state.key || !state.direction) return items;
    return [...items].sort((a, b) => {
      let aVal: any = a[state.key as keyof ScrapingHistory];
      let bVal: any = b[state.key as keyof ScrapingHistory];
      // For date fields, compare as dates
      if (["startTime", "endTime", "updatedAt"].includes(state.key)) {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      // For status, compare as string
      if (state.key === "status") {
        aVal = aVal || "";
        bVal = bVal || "";
      }
      // For numbers, ensure number type
      if (["createdItems", "updatedItems", "totalItems", "progress"].includes(state.key)) {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }
      if (aVal < bVal) return state.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return state.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // When expanding a scraper, set its subSortState to updatedAt desc if not already set
  const handleExpand = (scraper: string) => {
    setExpanded((e) => ({ ...e, [scraper]: !e[scraper] }));
    setSubSortState((prev) => {
      if (prev[scraper]) return prev;
      return { ...prev, [scraper]: { key: 'updatedAt', direction: 'desc' } };
    });
  };

  const inProgressSummaries = summaries.filter((s) => s.history[0]?.status === "in_progress");
  const otherSummaries = summaries.filter((s) => s.history[0]?.status !== "in_progress");

  function getEta(item: ScrapingHistory) {
    if (!item.progress) {
        return "-";
    }

    const secondsForOnePercent = getRunTime(item.startTime, item.endTime) / item.progress;
    const remainingPercents = 100 - item.progress;
    return remainingPercents * secondsForOnePercent;
  }

  const renderTable = (items: ScraperSummary[], title: string, statusHeader: string, scanRateHeader: string) => {
    const table = items.length == 0 ? <span>None</span> : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ textAlign: "left", padding: 8 }}>#</th>
            <th style={{ textAlign: "left", padding: 8, cursor: "pointer" }} onClick={() => handleSort("scraper")}>Scraper {sortState.key === 'scraper' && (sortState.direction === 'asc' ? '↑' : '↓')}</th>
            <th style={{ textAlign: "left", padding: 8, cursor: "pointer" }} onClick={() => handleSort("status")}>{statusHeader} {sortState.key === 'status' && (sortState.direction === 'asc' ? '↑' : '↓')}</th>
            <th style={{ textAlign: "left", padding: 8, cursor: "pointer" }} onClick={() => handleSort("startTime")}>Run Time {sortState.key === 'startTime' && (sortState.direction === 'asc' ? '↑' : '↓')}</th>
            <th style={{ textAlign: "left", padding: 8, cursor: "pointer" }} onClick={() => handleSort("eta")}>ETA {sortState.key === 'eta' && (sortState.direction === 'asc' ? '↑' : '↓')}</th>
            <th style={{ textAlign: "left", padding: 8, cursor: "pointer" }} onClick={() => handleSort("updatedAt")}>Last Update {sortState.key === 'updatedAt' && (sortState.direction === 'asc' ? '↑' : '↓')}</th>
            <th style={{ textAlign: "left", padding: 8, cursor: "pointer" }} onClick={() => handleSort("scannedItems")}>Scanned Items {sortState.key === 'scannedItems' && (sortState.direction === 'asc' ? '↑' : '↓')}</th>
            <th style={{ textAlign: "left", padding: 8, cursor: "pointer" }} onClick={() => handleSort("ratePerMinute")}>{scanRateHeader} (items/min) {sortState.key === 'ratePerMinute' && (sortState.direction === 'asc' ? '↑' : '↓')}</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((s, index) => {
            const last = s.history[0];
            const scannedItems = (last?.createdItems ?? 0) + (last?.updatedItems ?? 0);
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
                      onClick={() => handleExpand(s.scraper)}
                    >
                      {s.scraper}
                    </span>
                  </td>
                  <td style={{ padding: 8, color: getStatusColor(last?.status) }}>
                    {last?.status === 'in_progress' ? `${last?.status?.replace('_', ' ')} (${last.progress}%)` : last?.status || "-"}
                  </td>
                  <td style={{ padding: 8 }}>
                    {last?.status === 'in_progress' ? formatRunTime(last.startTime, null) : last?.startTime ? formatRunTime(last.startTime, last.endTime) : '-'}
                  </td>
                  <td>
                    {Number(getEta(last)).toFixed(2)}
                  </td>
                  <td style={{ padding: 8 }}>
                    {last?.updatedAt ? `${formatTime(last.updatedAt)} (${formatTimeAgo(last.updatedAt)})` : "-"}
                  </td>
                  <td style={{ padding: 8 }}>{scannedItems.toLocaleString()}</td>
                  <td style={{ padding: 8 }}>
                    {last.ratePerMinute ? last.ratePerMinute.toFixed(2) : "-"}
                  </td>
                  <td style={{ padding: 8 }}>
                    <button
                      onClick={() => handleExpand(s.scraper)}
                    >
                      {expanded[s.scraper] ? "Hide" : "Show"} History
                    </button>
                  </td>
                </tr>
                {expanded[s.scraper] && (
                  <tr>
                    <td colSpan={8} style={{ background: "#fafbfc", padding: 0 }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", margin: 0 }}>
                        <thead>
                          <tr style={{ background: "#f0f0f0" }}>
                            <th style={{ textAlign: "left", padding: 6, cursor: "pointer" }} onClick={() => handleSubSort(s.scraper, "startTime")}>Start {subSortState[s.scraper]?.key === 'startTime' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                            <th style={{ textAlign: "left", padding: 6, cursor: "pointer" }} onClick={() => handleSubSort(s.scraper, "endTime")}>End {subSortState[s.scraper]?.key === 'endTime' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                            <th style={{ textAlign: "left", padding: 6, cursor: "pointer" }} onClick={() => handleSubSort(s.scraper, "updatedAt")}>Last Update {subSortState[s.scraper]?.key === 'updatedAt' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                            <th style={{ textAlign: "left", padding: 6, cursor: "pointer" }} onClick={() => handleSubSort(s.scraper, "status")}>Status {subSortState[s.scraper]?.key === 'status' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                            <th style={{ textAlign: "left", padding: 6, cursor: "pointer" }} onClick={() => handleSubSort(s.scraper, "createdItems")}>Created {subSortState[s.scraper]?.key === 'createdItems' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                            <th style={{ textAlign: "left", padding: 6, cursor: "pointer" }} onClick={() => handleSubSort(s.scraper, "updatedItems")}>Updated {subSortState[s.scraper]?.key === 'updatedItems' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                            <th style={{ textAlign: "left", padding: 6, cursor: "pointer" }} onClick={() => handleSubSort(s.scraper, "totalItems")}>Total {subSortState[s.scraper]?.key === 'totalItems' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                            <th style={{ textAlign: "left", padding: 6, cursor: "pointer" }} onClick={() => handleSubSort(s.scraper, "progress")}>Progress {subSortState[s.scraper]?.key === 'progress' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applySubSort(s.scraper, s.history).map((h) => (
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
                              <td style={{ padding: 6 }}>{h.createdItems.toLocaleString()}</td>
                              <td style={{ padding: 6 }}>{h.updatedItems.toLocaleString()}</td>
                              <td style={{ padding: 6 }}>{h.totalItems.toLocaleString()}</td>
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
    );
    
    return (
        <>
        <h2 style={{ marginTop: 32 }}>{title}</h2>
        
        {table}
        </>
    );
    }

  function renderContent(){
    if (isLoading) return <div style={{ padding: 32 }}>Loading...</div>;
    if (error) return <div style={{ padding: 32, color: "red" }}>Error loading status</div>;

    return (
        <AdminGuard>
            <div style={{ padding: 32, paddingBottom: 80 }}>
                <h1>Status of Scrapers</h1>
                {renderTable(applySort(inProgressSummaries), "🟠 In Progress", 'Current Status', 'Current Scan Rate')}
                {renderTable(applySort(otherSummaries), "✅ Others", 'Last Status', 'Last Scan Rate')}
            </div>
        </AdminGuard>
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