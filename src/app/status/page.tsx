"use client";
import React, { useState } from "react";
import { useScrapingHistorySummaryQuery } from "../../api/scraping-history/queries";
import { useAllUsersQuery, useSourceStatsQuery, useCategoryStatsQuery, useBrandStatsQuery, useTotalProductsQuery, useDailyStatsQuery } from '../../api/auth/queries';
import Header from "../../components/header/header";
import AdminGuard from "../../components/admin-guard";
import { Loader } from "../../components/loader/loader";
import styles from "./page.module.css";
import { ucfirst } from "../../utils/utils";
import { GiProgression } from "react-icons/gi";
import { TbProgressCheck } from "react-icons/tb";
import { TbProgress } from "react-icons/tb";

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
  type: 'auto' | 'manual';
}

interface ScraperSummary {
  scraper: string;
  history: ScrapingHistory[];
  currentScan: ScrapingHistory | null;
  ratePerMinute: number | null;
}

type SortDirection = 'asc' | 'desc' | null;
type SortKey = 'scraper' | 'status' | 'updatedAt' | 'ratePerMinute' | 'scannedItems' | 'startTime' | 'eta' | 'type' | 'createdItems';

const StatusPage = () => {
  const { data: summaries = [], isLoading, error } = useScrapingHistorySummaryQuery();
  const { data: users = [], isLoading: usersLoading, error: usersError } = useAllUsersQuery();
  const { data: sourceStats = [], isLoading: sourcesLoading } = useSourceStatsQuery();
  const { data: categoryStats = [], isLoading: categoriesLoading } = useCategoryStatsQuery();
  const { data: brandStats = [], isLoading: brandsLoading } = useBrandStatsQuery();
  const { data: totalProductsData, isLoading: totalProductsLoading } = useTotalProductsQuery();
  const { data: dailyStatsData, isLoading: dailyStatsLoading } = useDailyStatsQuery();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  
  // Search state for different tables
  const [scraperSearch, setScraperSearch] = useState('');
  const [subTableSearch, setSubTableSearch] = useState<Record<string, string>>({});
  const [sourceSearch, setSourceSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  
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
  const [showSources, setShowSources] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showBrands, setShowBrands] = useState(false);
  const [showScrapers, setShowScrapers] = useState(true);
  const [showUsers, setShowUsers] = useState(true);
  const [showInProgress, setShowInProgress] = useState(true);
  const [showOthers, setShowOthers] = useState(false);

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
        if (sortState.key === 'type') return item.history[0]?.type || '';
        if (sortState.key === 'createdItems') return item.history[0]?.createdItems ?? 0;
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
      // For type, compare as string
      if (state.key === 'type') {
        aVal = aVal || '';
        bVal = bVal || '';
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

  // Filter summaries by search term
  const filteredSummaries = summaries.filter((s) => 
    !scraperSearch || s.scraper.toLowerCase().includes(scraperSearch.toLowerCase())
  );
  
  const inProgressSummaries = filteredSummaries.filter((s) => s.history[0]?.status === "in_progress");
  const otherSummaries = filteredSummaries.filter((s) => s.history[0]?.status !== "in_progress");

  function getEta(item: ScrapingHistory) {
    if (!item.progress || item.progress === 0) {
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

  const renderTable = (items: ScraperSummary[], title: string, statusHeader: string, scanRateHeader: string, typeHeader: string, marginTop = 32) => {
    const search = (
      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Search scrapers..."
          value={scraperSearch}
          onChange={(e) => setScraperSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>
    );
    const table = items.length == 0 ? <span>None</span> : (
        <>
          <div className={styles.tableContainer}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>#</th>
                    <th onClick={() => handleSort("scraper")}>Scraper {sortState.key === 'scraper' && (sortState.direction === 'asc' ? '↑' : '↓')}</th>
                    <th onClick={() => handleSort("status")}>{statusHeader} {sortState.key === 'status' && (sortState.direction === 'asc' ? '↑' : '↓')}</th>
                    <th onClick={() => handleSort("startTime")}>Run Time {sortState.key === 'startTime' && (sortState.direction === 'asc' ? '↑' : '↓')}</th>
                    {statusHeader.includes("Current") && <th onClick={() => handleSort("eta")}>ETA {sortState.key === 'eta' && (sortState.direction === 'asc' ? '↑' : '↓')}</th>}
                    <th onClick={() => handleSort("updatedAt")}>Last Update {sortState.key === 'updatedAt' && (sortState.direction === 'asc' ? '↑' : '↓')}</th>
                    <th onClick={() => handleSort("scannedItems")}>Scanned Items {sortState.key === 'scannedItems' && (sortState.direction === 'asc' ? '↑' : '↓')}</th>
                    <th onClick={() => handleSort("createdItems")}>Created Items {sortState.key === 'createdItems' && (sortState.direction === 'asc' ? '↑' : '↓')}</th>
                    <th onClick={() => handleSort("ratePerMinute")}>{scanRateHeader} (items/min) {sortState.key === 'ratePerMinute' && (sortState.direction === 'asc' ? '↑' : '↓')}</th>
                    <th onClick={() => handleSort("type")}>{typeHeader} {sortState.key === 'type' && (sortState.direction === 'asc' ? '↑' : '↓')}</th>
                  </tr>
                </thead>
              <tbody className={styles.tableBody}>
                {items.map((s, index) => {
                  const last = s.history[0];
                  const scannedItems = (last?.createdItems ?? 0) + (last?.updatedItems ?? 0);
                  return (
                    <React.Fragment key={s.scraper}>
                      <tr>
                        <td>{index + 1}</td>
                        <td>
                          <span
                            className={styles.scraperLink}
                            onClick={() => handleExpand(s.scraper)}
                          >
                            {s.scraper}
                          </span>
                        </td>
                        <td>
                          <span className={last?.status === 'in_progress' ? styles.statusInProgress : last?.status === 'finished' ? styles.statusFinished : styles.statusFailed}>{last?.status === 'in_progress' ? `${last?.status?.replace('_', ' ')} (${ucfirst(last.progress.toString())}%)` : ucfirst(last?.status) || "-"}</span>
                        </td>
                        <td>
                          {last?.status === 'in_progress' ? formatRunTime(last.startTime, null) : last?.startTime ? formatRunTime(last.startTime, last.endTime) : '-'}
                        </td>
                        {statusHeader.includes("Current") && <td>
                          {formatSeconds(Number(getEta(last)))}
                        </td>}
                        <td>
                          {last?.updatedAt ? `${formatTime(last.updatedAt)} (${formatTimeAgo(last.updatedAt)})` : "-"}
                        </td>
                        <td>{scannedItems.toLocaleString()}</td>
                        <td>
                          {last.createdItems ? last.createdItems.toLocaleString() : '0'}
                        </td>
                        <td>
                          {last.ratePerMinute ? last.ratePerMinute.toFixed(2) : "-"}
                        </td>
                        <td>
                          {last.type === 'auto' ? 'Auto' : 'Manual'}
                        </td>
                      </tr>
                      {expanded[s.scraper] && (
                        <tr className={styles.expandedRow}>
                          <td colSpan={10}>
                            <table className={styles.expandedTable}>
                              <thead className={styles.expandedTableHeader}>
                                <tr>
                                  <th onClick={() => handleSubSort(s.scraper, "startTime")}>Start {subSortState[s.scraper]?.key === 'startTime' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                                  <th onClick={() => handleSubSort(s.scraper, "endTime")}>End {subSortState[s.scraper]?.key === 'endTime' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                                  <th onClick={() => handleSubSort(s.scraper, "runTime")}>Run Time {subSortState[s.scraper]?.key === 'runTime' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                                  <th onClick={() => handleSubSort(s.scraper, "updatedAt")}>Last Update {subSortState[s.scraper]?.key === 'updatedAt' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                                  <th onClick={() => handleSubSort(s.scraper, "status")}>Status {subSortState[s.scraper]?.key === 'status' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                                  <th onClick={() => handleSubSort(s.scraper, "createdItems")}>Created {subSortState[s.scraper]?.key === 'createdItems' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                                  <th onClick={() => handleSubSort(s.scraper, "updatedItems")}>Updated {subSortState[s.scraper]?.key === 'updatedItems' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                                  <th onClick={() => handleSubSort(s.scraper, "totalItems")}>Total {subSortState[s.scraper]?.key === 'totalItems' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                                  <th onClick={() => handleSubSort(s.scraper, "progress")}>Progress {subSortState[s.scraper]?.key === 'progress' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                                  <th onClick={() => handleSubSort(s.scraper, "scanRate")}>Scan Rate (items/min) {subSortState[s.scraper]?.key === 'scanRate' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                                  <th onClick={() => handleSubSort(s.scraper, "type")}>Type {subSortState[s.scraper]?.key === 'type' && (subSortState[s.scraper]?.direction === 'asc' ? '↑' : '↓')}</th>
                                </tr>
                              </thead>
                              <tbody className={styles.expandedTableBody}>
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
                                    <tr key={h.id}>
                                      <td>
                                        {h.startTime ? formatTime(h.startTime) : "-"}
                                      </td>
                                      <td>
                                        {h.endTime ? formatTime(h.endTime) : "-"}
                                      </td>
                                      <td>{h._runTimeStr}</td>
                                      <td>
                                        {h.updatedAt ? formatTime(h.updatedAt) : "-"}
                                      </td>
                                      <td className={h.status === 'in_progress' ? styles.statusInProgress : h.status === 'finished' ? styles.statusFinished : styles.statusFailed}>
                                        {h.status}
                                      </td>
                                      <td>{h.createdItems.toLocaleString()}</td>
                                      <td>{h.updatedItems.toLocaleString()}</td>
                                      <td>{h.totalItems.toLocaleString()}</td>
                                      <td>{h.progress}%</td>
                                      <td>{h._scanRateStr}</td>
                                      <td>{h.type === 'auto' ? 'Auto' : 'Manual'}</td>
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
            </div>
          </div>
        </>
      );

    return (
        <>
        {title && <h2 style={{ marginTop }}>{title}</h2>}
        {search}
        {table}
        </>
    );
    }

  function renderSourceStatsTable() {
    if (sourcesLoading) return <div>Loading sources...</div>;
    const filteredSourceStats = sourceStats.filter((row: any) => 
      !sourceSearch || row.name.toLowerCase().includes(sourceSearch.toLowerCase())
    );
    const rows = sortRows(filteredSourceStats, sourceSort).slice(0, 50);
    return (
      <div className={styles.sectionContainer}>
        <h2 className={`${styles.sectionTitle} ${!showSources ? styles.collapsed : ''}`} onClick={() => setShowSources(s => !s)}>
          Sources ({sourceStats?.length || 0})
        </h2>
        {showSources && (
          <div className={styles.sectionContent}>
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Search sources..."
                value={sourceSearch}
                onChange={(e) => setSourceSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.tableContainer}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th onClick={() => handleTableSort(sourceSort, setSourceSort, 'id')}>ID {sourceSort.key === 'id' && (sourceSort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleTableSort(sourceSort, setSourceSort, 'name')}>Name {sourceSort.key === 'name' && (sourceSort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleTableSort(sourceSort, setSourceSort, 'total')}>Total {sourceSort.key === 'total' && (sourceSort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleTableSort(sourceSort, setSourceSort, 'men')}>Men {sourceSort.key === 'men' && (sourceSort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleTableSort(sourceSort, setSourceSort, 'women')}>Women {sourceSort.key === 'women' && (sourceSort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleTableSort(sourceSort, setSourceSort, 'unisex')}>Unisex {sourceSort.key === 'unisex' && (sourceSort.direction === 'asc' ? '↑' : '↓')}</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {rows.map((row: any) => {
                      const total = Number(row.men) + Number(row.women) + Number(row.unisex);
                      return (
                        <tr key={row.id}>
                          <td>{row.id}</td>
                          <td>{row.name}</td>
                          <td>{total.toLocaleString()}</td>
                          <td>{Number(row.men).toLocaleString()}</td>
                          <td>{Number(row.women).toLocaleString()}</td>
                          <td>{Number(row.unisex).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

    function renderCategoryStatsTable() {
    if (categoriesLoading) return <div>Loading categories...</div>;
    const filteredCategoryStats = categoryStats.filter((row: any) => 
      !categorySearch || row.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
    const rows = sortRows(filteredCategoryStats, categorySort).slice(0, 50);
    return (
      <div className={styles.sectionContainer}>
        <h2 className={`${styles.sectionTitle} ${!showCategories ? styles.collapsed : ''}`} onClick={() => setShowCategories(s => !s)}>
          Categories ({categoryStats?.length || 0})
        </h2>
        {showCategories && (
          <div className={styles.sectionContent}>
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.tableContainer}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th onClick={() => handleTableSort(categorySort, setCategorySort, 'id')}>ID {categorySort.key === 'id' && (categorySort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleTableSort(categorySort, setCategorySort, 'name')}>Name {categorySort.key === 'name' && (categorySort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleTableSort(categorySort, setCategorySort, 'total')}>Total {categorySort.key === 'total' && (categorySort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleTableSort(categorySort, setCategorySort, 'men')}>Men {categorySort.key === 'men' && (categorySort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleTableSort(categorySort, setCategorySort, 'women')}>Women {categorySort.key === 'women' && (categorySort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleTableSort(categorySort, setCategorySort, 'unisex')}>Unisex {categorySort.key === 'unisex' && (categorySort.direction === 'asc' ? '↑' : '↓')}</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {rows.map((row: any) => {
                      const total = Number(row.men) + Number(row.women) + Number(row.unisex);
                      return (
                        <tr key={row.name}>
                          <td>{row.id}</td>
                          <td>{row.name}</td>
                          <td>{total}</td>
                          <td>{row.men}</td>
                          <td>{row.women}</td>
                          <td>{row.unisex}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderBrandStatsTable() {
    if (brandsLoading) return <div>Loading brands...</div>;
    const filteredBrandStats = brandStats.filter((row: any) => 
      !brandSearch || row.name.toLowerCase().includes(brandSearch.toLowerCase())
    );
    const rows = sortRows(filteredBrandStats, brandSort).slice(0, 50);
    return (
      <div className={styles.sectionContainer}>
        <h2 className={`${styles.sectionTitle} ${!showBrands ? styles.collapsed : ''}`} onClick={() => setShowBrands(s => !s)}>
          Brands ({brandStats?.length || 0})
        </h2>
        {showBrands && (
          <div className={styles.sectionContent}>
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Search brands..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.tableContainer}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th onClick={() => handleTableSort(brandSort, setBrandSort, 'id')}>ID {brandSort.key === 'id' && (brandSort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleTableSort(brandSort, setBrandSort, 'name')}>Name {brandSort.key === 'name' && (brandSort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleTableSort(brandSort, setBrandSort, 'total')}>Total {brandSort.key === 'total' && (brandSort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleTableSort(brandSort, setBrandSort, 'men')}>Men {brandSort.key === 'men' && (brandSort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleTableSort(brandSort, setBrandSort, 'women')}>Women {brandSort.key === 'women' && (brandSort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleTableSort(brandSort, setBrandSort, 'unisex')}>Unisex {brandSort.key === 'unisex' && (brandSort.direction === 'asc' ? '↑' : '↓')}</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {rows.map((row: any) => {
                      const total = Number(row.men) + Number(row.women) + Number(row.unisex);
                      return (
                        <tr key={row.name}>
                          <td>{row.id}</td>
                          <td>{row.name}</td>
                          <td>{total}</td>
                          <td>{row.men}</td>
                          <td>{row.women}</td>
                          <td>{row.unisex}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderUsersTable() {
    if (usersLoading) return <div style={{ padding: 32 }}>Loading users...</div>;
    if (usersError) return <div style={{ padding: 32, color: 'red' }}>Error loading users</div>;
    const filteredUsers = users.filter((user: any) => 
      !userSearch || user.username.toLowerCase().includes(userSearch.toLowerCase())
    );
    const sortedFilteredUsers = [...filteredUsers].sort((a, b) => {
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
    return (
      <div className={styles.sectionContainer}>
        <h2 className={`${styles.sectionTitle} ${!showUsers ? styles.collapsed : ''}`} onClick={() => setShowUsers(s => !s)}>
          Users ({users?.length || 0})
        </h2>
        {showUsers && (
          <div className={styles.sectionContent}>
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.tableContainer}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th onClick={() => handleUserSort('id')}>ID {userSort.key === 'id' && (userSort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleUserSort('username')}>Username {userSort.key === 'username' && (userSort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleUserSort('createdAt')}>Joined {userSort.key === 'createdAt' && (userSort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleUserSort('lastLoginAt')}>Last Login {userSort.key === 'lastLoginAt' && (userSort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleUserSort('totalSearches')}>Total Searches {userSort.key === 'totalSearches' && (userSort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleUserSort('favouritesCount')}>Favourites {userSort.key === 'favouritesCount' && (userSort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleUserSort('filterSetsCount')}>Filter Sets {userSort.key === 'filterSetsCount' && (userSort.direction === 'asc' ? '↑' : '↓')}</th>
                      <th onClick={() => handleUserSort('userType')}>Type {userSort.key === 'userType' && (userSort.direction === 'asc' ? '↑' : '↓')}</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {sortedFilteredUsers.map((u: any) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.username}</td>
                        <td>{u.createdAt ? formatTime(u.createdAt) : '-'}</td>
                        <td>{u.lastLoginAt ? formatTime(u.lastLoginAt) : '-'}</td>
                        <td>{u.totalSearches}</td>
                        <td>{u.favouritesCount}</td>
                        <td>{u.filterSetsCount || 0}</td>
                        <td>{u.userType === 'google' ? 'Google' : 'Regular'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderScrapersSection() {
    return (
      <div className={styles.sectionContainer}>
        <h2 className={`${styles.sectionTitle} ${!showScrapers ? styles.collapsed : ''}`} onClick={() => setShowScrapers(s => !s)}>
          Status of Scrapers ({summaries?.length || 0})
        </h2>
        {showScrapers && (
          <div className={styles.sectionContent}>
            <div className={styles.subSectionContainer}>
              <h3 className={`${styles.subSectionTitle} ${!showInProgress ? styles.collapsed : ''}`} onClick={() => setShowInProgress(s => !s)}>
                <div className="flex-row align-items-center gap-4"><TbProgress style={{ fontSize: 20, color: 'var(--bs-orange-5)' }} /> <span>In Progress ({inProgressSummaries.length})</span></div>
              </h3>
              {showInProgress && (
                <div className={styles.subSectionContent}>
                  {renderTable(applySort(inProgressSummaries), '', 'Current Status', 'Current Scan Rate', 'Type', 12)}
                </div>
              )}
            </div>
            <div className={styles.subSectionContainer}>
              <h3 className={`${styles.subSectionTitle} ${!showOthers ? styles.collapsed : ''}`} onClick={() => setShowOthers(s => !s)}>
                <div className="flex-row align-items-center gap-4"><TbProgressCheck style={{ fontSize: 20, color: 'var(--bs-green-5)' }} /> <span>Others ({otherSummaries.length})</span></div>
              </h3>
              {showOthers && (
                <div className={styles.subSectionContent}>
                  {renderTable(applySort(otherSummaries), '', 'Last Status', 'Last Scan Rate', 'Last Scan Type')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderContent(){
    if (isLoading) return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader isGray />
        </div>
      );
    if (error) return <div style={{ padding: 32, color: "red" }}>Error loading status</div>;

    return (
        <AdminGuard>
            <div className={styles.container}>
                <div className={styles.summaryBar}>
                  <div className={styles.summaryBarContent}>
                    <div className={styles.summaryBarTitle}>
                    <GiProgression style={{ fontSize: 20, color: 'var(--bs-blue-5)' }} />
                      <span>Dashboard Overview</span>
                    </div>
                    <div className={styles.summaryStats}>
                      <div className={styles.summaryStat}>
                        <div className={styles.summaryStatLabel}>Total Products</div>
                        <div className={`${styles.summaryStatValue} ${totalProductsLoading ? styles.loading : ''}`}>
                          {totalProductsLoading ? 'Loading...' : Number(totalProductsData?.total).toLocaleString() ?? 0}
                        </div>
                      </div>
                      <div className={styles.summaryStat}>
                        <div className={styles.summaryStatLabel}>Added Today</div>
                        <div className={`${styles.summaryStatValue} ${dailyStatsLoading ? styles.loading : ''}`}>
                          {dailyStatsLoading ? 'Loading...' : Number(dailyStatsData?.total_added_today || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className={styles.summaryStat}>
                        <div className={styles.summaryStatLabel}>Updated Today</div>
                        <div className={`${styles.summaryStatValue} ${dailyStatsLoading ? styles.loading : ''}`}>
                          {dailyStatsLoading ? 'Loading...' : Number(dailyStatsData?.total_updated_today || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className={styles.summaryStat}>
                        <div className={styles.summaryStatLabel}>Price Changes Today</div>
                        <div className={`${styles.summaryStatValue} ${dailyStatsLoading ? styles.loading : ''}`}>
                          {dailyStatsLoading ? 'Loading...' : Number(dailyStatsData?.total_price_changes_today || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
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
        <Header scrolled isStatusPage />
        {renderContent()}
    </>
  )
};

export default StatusPage;