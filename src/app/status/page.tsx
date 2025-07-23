"use client";
import React, { useState } from "react";
import { useScrapingHistorySummaryQuery } from "../../api/scraping-history/queries";
import { useAllUsersQuery, useSourceStatsQuery, useCategoryStatsQuery, useBrandStatsQuery, useTotalProductsQuery } from '../../api/auth/queries';
import Header from "../../components/header/header";
import AdminGuard from "../../components/admin-guard";
import { Loader } from "../../components/loader/loader";

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
  const { data: users = [], isLoading: usersLoading, error: usersError } = useAllUsersQuery();
  const { data: sourceStats = [], isLoading: sourcesLoading } = useSourceStatsQuery();
  const { data: categoryStats = [], isLoading: categoriesLoading } = useCategoryStatsQuery();
  const { data: brandStats = [], isLoading: brandsLoading } = useBrandStatsQuery();
  const { data: totalProductsData, isLoading: totalProductsLoading } = useTotalProductsQuery();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // Default main sort: updatedAt desc
  const [sortState, setSortState] = useState<{ key: SortKey | null; direction: SortDirection }>({
    key: 'updatedAt',
    direction: 'desc',
  });
  // Add per-scraper sub-table sort state, default to updatedAt desc on first expand
  const [subSortState, setSubSortState] = useState<Record<string, { key: string | null; direction: SortDirection }>>({});
  // Users table sort state
  const [userSort, setUserSort] = useState<{ key: string, direction: SortDirection }>({ key: 'lastLoginAt', direction: 'desc' });
  // Sorting state for new tables
  const [sourceSort, setSourceSort] = useState<{ key: string, direction: SortDirection }>({ key: 'total', direction: 'desc' });
  const [categorySort, setCategorySort] = useState<{ key: string, direction: SortDirection }>({ key: 'total', direction: 'desc' });
  const [brandSort, setBrandSort] = useState<{ key: string, direction: SortDirection }>({ key: 'total', direction: 'desc' });
  // Collapsible state for each section
  const [showSources, setShowSources] = useState(true);
  const [showCategories, setShowCategories] = useState(true);
  const [showBrands, setShowBrands] = useState(true);
  const [showScrapers, setShowScrapers] = useState(true);
  const [showUsers, setShowUsers] = useState(true);

  const handleUserSort = (key: string) => {
    setUserSort((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return { key: 'createdAt', direction: 'desc' };
    });
  };

  const sortedUsers = [...(users || [])].sort((a, b) => {
    let aVal = a[userSort.key];
    let bVal = b[userSort.key];
    if (userSort.key.includes('At')) {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return userSort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return userSort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  function formatTime(lastUpdate: string) {
    const utcDate = new Date(lastUpdate);
    const offsetMinutes = new Date().getTimezoneOffset();
    const offsetMillis = -offsetMinutes * 60 * 1000;
    const isLocal = window.location.href.includes("localhost2");
    const doubleOffsetDate = new Date(utcDate.getTime() + (isLocal ? offsetMillis : 0));
    return doubleOffsetDate.toLocaleString("en-IL", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }

  function getRunTime(startTime: string, endTime: string | null) {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : new Date().getTime();
    let diff = Math.max(0, end - start) / 1000; // seconds
    return diff;
  }

  // Add helper to format run time
  function formatRunTime(startTime: string, endTime: string | null) {
    if (!startTime) return '-';
    let diff = getRunTime(startTime, endTime);
    return formatSeconds(diff);
  }

  function formatSeconds(seconds: number) {
    const h = Math.floor(seconds / 3600);
    seconds -= h * 3600;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds - m * 60);
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

    const isLocal = window.location.href.includes("localhost2");
    const then = new Date(dateStr).getTime() + (isLocal ? offsetMillis : 0);
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
        if (sortState.key === 'ratePerMinute') {
            console.log(item.scraper, item.history[0].ratePerMinute);
            return item.history[0].ratePerMinute ? Number(item.history[0].ratePerMinute) : -1
        }
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
  const applySubSort = (scraper: string, items: any[]) => {
    const state = subSortState[scraper];
    if (!state || !state.key || !state.direction) return items;
    return [...items].sort((a, b) => {
      let aVal: any = a[state.key];
      let bVal: any = b[state.key];
      // Custom sort for runTime and scanRate
      if (state.key === 'runTime') {
        aVal = a._runTimeMs ?? 0;
        bVal = b._runTimeMs ?? 0;
      }
      if (state.key === 'scanRate') {
        aVal = a._scanRateNum ?? 0;
        bVal = b._scanRateNum ?? 0;
      }
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

  const handleTableSort = (sortState: any, setSortState: any, key: string) => {
    setSortState((prev: any) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return { key, direction: 'asc' };
    });
  };

  function sortRows(rows: any[], sort: { key: string, direction: SortDirection }) {
    return [...(rows || [])].sort((a, b) => {
      let aVal = a[sort.key];
      let bVal = b[sort.key];
      // Numeric sort for numeric columns
      if (sort.key == "total") {
        aVal = Number(a.men) + Number(a.women) + Number(a.unisex);
        bVal = Number(b.men) + Number(b.women) + Number(b.unisex);
      }
      if (["id", "total", "men", "women", "unisex"].includes(sort.key)) {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
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
            {statusHeader.includes("Current") && <th style={{ textAlign: "left", padding: 8, cursor: "pointer" }} onClick={() => handleSort("eta")}>ETA {sortState.key === 'eta' && (sortState.direction === 'asc' ? '↑' : '↓')}</th>}
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
                  {statusHeader.includes("Current") && <td>
                    {formatSeconds(Number(getEta(last)))}
                  </td>}
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
                            <th style={{ textAlign: "left", padding: 6, cursor: "pointer" }} onClick={() => handleSubSort(s.scraper, "runTime")}>Run Time {subSortState[s.scraper]?.key === 'runTime' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                            <th style={{ textAlign: "left", padding: 6, cursor: "pointer" }} onClick={() => handleSubSort(s.scraper, "updatedAt")}>Last Update {subSortState[s.scraper]?.key === 'updatedAt' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                            <th style={{ textAlign: "left", padding: 6, cursor: "pointer" }} onClick={() => handleSubSort(s.scraper, "status")}>Status {subSortState[s.scraper]?.key === 'status' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                            <th style={{ textAlign: "left", padding: 6, cursor: "pointer" }} onClick={() => handleSubSort(s.scraper, "createdItems")}>Created {subSortState[s.scraper]?.key === 'createdItems' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                            <th style={{ textAlign: "left", padding: 6, cursor: "pointer" }} onClick={() => handleSubSort(s.scraper, "updatedItems")}>Updated {subSortState[s.scraper]?.key === 'updatedItems' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                            <th style={{ textAlign: "left", padding: 6, cursor: "pointer" }} onClick={() => handleSubSort(s.scraper, "totalItems")}>Total {subSortState[s.scraper]?.key === 'totalItems' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                            <th style={{ textAlign: "left", padding: 6, cursor: "pointer" }} onClick={() => handleSubSort(s.scraper, "progress")}>Progress {subSortState[s.scraper]?.key === 'progress' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                            <th style={{ textAlign: "left", padding: 6, cursor: "pointer" }} onClick={() => handleSubSort(s.scraper, "scanRate")}>Scan Rate (items/min) {subSortState[s.scraper]?.key === 'scanRate' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            // Compute augmented rows for sorting and rendering
                            const augmentedHistory = s.history.map((h) => {
                              let scanRate = '-';
                              let runTime = '-';
                              let runTimeMs = null;
                              let scanRateNum = null;
                              if (h.startTime && (h.endTime || h.status === 'finished')) {
                                const start = new Date(h.startTime).getTime();
                                const end = h.endTime ? new Date(h.endTime).getTime() : Date.now();
                                runTimeMs = end - start;
                                const elapsedMinutes = runTimeMs / 60000;
                                const elapsedSeconds = Math.floor(runTimeMs / 1000);
                                const items = (h.createdItems || 0) + (h.updatedItems || 0);
                                if (elapsedMinutes > 0) {
                                  scanRateNum = items / elapsedMinutes;
                                  scanRate = scanRateNum.toFixed(2);
                                }
                                // Format run time as Xm Ys
                                const mins = Math.floor(elapsedSeconds / 60);
                                const secs = elapsedSeconds % 60;
                                runTime = `${mins > 0 ? mins + 'm ' : ''}${secs}s`;
                              }
                              return { ...h, _runTimeMs: runTimeMs, _scanRateNum: scanRateNum, _runTimeStr: runTime, _scanRateStr: scanRate };
                            });
                            // Use augmentedHistory for sorting and rendering
                            return applySubSort(s.scraper, augmentedHistory).map((h) => (
                              <tr key={h.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: 6 }}>
                                  {h.startTime ? formatTime(h.startTime) : "-"}
                                </td>
                                <td style={{ padding: 6 }}>
                                  {h.endTime ? formatTime(h.endTime) : "-"}
                                </td>
                                <td style={{ padding: 6 }}>{h._runTimeStr}</td>
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
                                <td style={{ padding: 6 }}>{h._scanRateStr}</td>
                              </tr>
                            ));
                          })()}
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

  function renderSourceStatsTable() {
    if (sourcesLoading) return <div>Loading sources...</div>;
    const rows = sortRows(sourceStats, sourceSort).slice(0, 50);
    return (
      <>
        <h2 style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => setShowSources(s => !s)}>
          Sources {showSources ? '▼' : '▶'}
        </h2>
        {showSources && (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleTableSort(sourceSort, setSourceSort, 'id')}>ID {sourceSort.key === 'id' && (sourceSort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleTableSort(sourceSort, setSourceSort, 'name')}>Name {sourceSort.key === 'name' && (sourceSort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleTableSort(sourceSort, setSourceSort, 'total')}>Total {sourceSort.key === 'total' && (sourceSort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleTableSort(sourceSort, setSourceSort, 'men')}>Men {sourceSort.key === 'men' && (sourceSort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleTableSort(sourceSort, setSourceSort, 'women')}>Women {sourceSort.key === 'women' && (sourceSort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleTableSort(sourceSort, setSourceSort, 'unisex')}>Unisex {sourceSort.key === 'unisex' && (sourceSort.direction === 'asc' ? '↑' : '↓')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any) => {
                  const total = Number(row.men) + Number(row.women) + Number(row.unisex);
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: 8 }}>{row.id}</td>
                      <td style={{ padding: 8 }}>{row.name}</td>
                      <td style={{ padding: 8 }}>{total.toLocaleString()}</td>
                      <td style={{ padding: 8 }}>{Number(row.men).toLocaleString()}</td>
                      <td style={{ padding: 8 }}>{Number(row.women).toLocaleString()}</td>
                      <td style={{ padding: 8 }}>{Number(row.unisex).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  }

  function renderCategoryStatsTable() {
    if (categoriesLoading) return <div>Loading categories...</div>;
    const rows = sortRows(categoryStats, categorySort).slice(0, 50);
    return (
      <>
        <h2 style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => setShowCategories(s => !s)}>
          Categories {showCategories ? '▼' : '▶'}
        </h2>
        {showCategories && (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleTableSort(categorySort, setCategorySort, 'name')}>Name {categorySort.key === 'name' && (categorySort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleTableSort(categorySort, setCategorySort, 'total')}>Total {categorySort.key === 'total' && (categorySort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleTableSort(categorySort, setCategorySort, 'men')}>Men {categorySort.key === 'men' && (categorySort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleTableSort(categorySort, setCategorySort, 'women')}>Women {categorySort.key === 'women' && (categorySort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleTableSort(categorySort, setCategorySort, 'unisex')}>Unisex {categorySort.key === 'unisex' && (categorySort.direction === 'asc' ? '↑' : '↓')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any) => {
                  const total = Number(row.men) + Number(row.women) + Number(row.unisex);
                  return (
                    <tr key={row.name} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: 8 }}>{row.name}</td>
                      <td style={{ padding: 8 }}>{total}</td>
                      <td style={{ padding: 8 }}>{row.men}</td>
                      <td style={{ padding: 8 }}>{row.women}</td>
                      <td style={{ padding: 8 }}>{row.unisex}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  }

  function renderBrandStatsTable() {
    if (brandsLoading) return <div>Loading brands...</div>;
    const rows = sortRows(brandStats, brandSort).slice(0, 50);
    return (
      <>
        <h2 style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => setShowBrands(s => !s)}>
          Brands {showBrands ? '▼' : '▶'}
        </h2>
        {showBrands && (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleTableSort(brandSort, setBrandSort, 'name')}>Name {brandSort.key === 'name' && (brandSort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleTableSort(brandSort, setBrandSort, 'total')}>Total {brandSort.key === 'total' && (brandSort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleTableSort(brandSort, setBrandSort, 'men')}>Men {brandSort.key === 'men' && (brandSort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleTableSort(brandSort, setBrandSort, 'women')}>Women {brandSort.key === 'women' && (brandSort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleTableSort(brandSort, setBrandSort, 'unisex')}>Unisex {brandSort.key === 'unisex' && (brandSort.direction === 'asc' ? '↑' : '↓')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any) => {
                  const total = Number(row.men) + Number(row.women) + Number(row.unisex);
                  return (
                    <tr key={row.name} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: 8 }}>{row.name}</td>
                      <td style={{ padding: 8 }}>{total}</td>
                      <td style={{ padding: 8 }}>{row.men}</td>
                      <td style={{ padding: 8 }}>{row.women}</td>
                      <td style={{ padding: 8 }}>{row.unisex}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  }

  function renderUsersTable() {
    if (usersLoading) return <div style={{ padding: 32 }}>Loading users...</div>;
    if (usersError) return <div style={{ padding: 32, color: 'red' }}>Error loading users</div>;
    return (
      <>
        <h2 style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => setShowUsers(s => !s)}>
          Users {showUsers ? '▼' : '▶'}
        </h2>
        {showUsers && (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleUserSort('username')}>Username {userSort.key === 'username' && (userSort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleUserSort('createdAt')}>Joined {userSort.key === 'createdAt' && (userSort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleUserSort('lastLoginAt')}>Last Login {userSort.key === 'lastLoginAt' && (userSort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleUserSort('totalSearches')}>Total Searches {userSort.key === 'totalSearches' && (userSort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th style={{ textAlign: 'left', padding: 8, cursor: 'pointer' }} onClick={() => handleUserSort('favouritesCount')}>Favourites {userSort.key === 'favouritesCount' && (userSort.direction === 'asc' ? '↑' : '↓')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((u: any) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 8 }}>{u.username}</td>
                    <td style={{ padding: 8 }}>{u.createdAt ? formatTime(u.createdAt) : '-'}</td>
                    <td style={{ padding: 8 }}>{u.lastLoginAt ? formatTime(u.lastLoginAt) : '-'}</td>
                    <td style={{ padding: 8 }}>{u.totalSearches}</td>
                    <td style={{ padding: 8 }}>{u.favouritesCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  }

  function renderScrapersSection() {
    return (
      <>
        <h2 style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => setShowScrapers(s => !s)}>
          Status of Scrapers {showScrapers ? '▼' : '▶'}
        </h2>
        {showScrapers && (
          <>
            {renderTable(applySort(inProgressSummaries), "🟠 In Progress", 'Current Status', 'Current Scan Rate')}
            {renderTable(applySort(otherSummaries), "✅ Others", 'Last Status', 'Last Scan Rate')}
          </>
        )}
      </>
    );
  }

  function renderContent(){
    if (isLoading) return <Loader />
    if (error) return <div style={{ padding: 32, color: "red" }}>Error loading status</div>;

    return (
        <AdminGuard>
            <div style={{ padding: 32, paddingBottom: 80 }}>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 24 }}>
                  {totalProductsLoading ? 'Loading product count...' : `Total products: ${Number(totalProductsData?.total).toLocaleString() ?? 0}`}
                </div>
                {renderScrapersSection()}
                {renderUsersTable()}
                {renderSourceStatsTable()}
                {renderCategoryStatsTable()}
                {renderBrandStatsTable()}
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