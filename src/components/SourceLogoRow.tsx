import React, { useState, useEffect } from "react";
import getSourceLogo, { Source } from "../utils/source-logo";
import styles from './SourceLogoRow.module.css'; // We'll create this CSS module next

// Helper function to shuffle an array
const shuffleArray = (array: Source[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const allSources = Object.values(Source);
const NUM_ROWS = 10; // Create 5 rows to fill the screen vertically

export default function SourceLogoRow() {
  const [logoRows, setLogoRows] = useState<Source[][]>([]);

  useEffect(() => {
    const rows = Array.from({ length: NUM_ROWS }).map(() => {
      // For each row, shuffle the sources and then duplicate them for a seamless scroll
      const shuffled = shuffleArray(allSources);
      return [...shuffled, ...shuffled];
    });
    setLogoRows(rows);
  }, []);

  return (
    <div className={styles.logoBackgroundContainer}>
      {logoRows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`${styles.logoTrack} ${rowIndex % 2 === 1 ? styles.reverse : ''}`}
        >
          {row.map((source, logoIndex) => {
            const logo = getSourceLogo(source);
            return logo ? (
              <img
                key={`${source}-${logoIndex}`}
                src={logo}
                alt={source}
                className={styles.logoImage}
              />
            ) : null;
          })}
        </div>
      ))}
    </div>
  );
}
