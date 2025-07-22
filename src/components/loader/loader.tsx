import React from 'react';
import styles from './loader.module.css';

export const Loader = () => (
    <div className={styles.message}>
        <img src="https://buysearch.s3.eu-north-1.amazonaws.com/loading.gif" />
        <span>Loading...</span>
    </div>
)