import React, { useEffect, useState } from 'react';
import styles from './loader.module.css';

export const Loader = () => {
    const [dotCount, setDotCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setDotCount(prev => (prev + 1) % 4);
        }, 400);
        return () => clearInterval(interval);
    }, []);

    // Render up to 3 dots, and fill the rest with invisible dots to keep width fixed
    const dots = Array.from({ length: 3 }).map((_, i) => (
        <span key={i} style={{ opacity: i < dotCount ? 1 : 0 }}>.</span>
    ));

    return (
        <div className={styles.message}>
            <img src="https://buysearch.s3.eu-north-1.amazonaws.com/loader.gif" />
            {/* <img src="https://buysearch.s3.eu-north-1.amazonaws.com/loading.gif" /> */}
            <span className={styles.loadingText}>
                Loading{dots}
            </span>
        </div>
    );
}