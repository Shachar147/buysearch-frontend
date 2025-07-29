'use client';

import React, { useState } from 'react';
import ColorPicker, { Color } from '../../components/color-picker/color-picker';

export default function ColorPickerDemo() {
  const [selectedColors, setSelectedColors] = useState<Color[]>([]);

  const handleColorSelect = (colors: Color[]) => {
    setSelectedColors(colors);
    console.log('Selected colors:', colors);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      <div style={{ textAlign: 'center', color: 'white', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: 'bold' }}>
          Color Picker Demo
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
          Search and select from all available colors
        </p>
      </div>

      <ColorPicker 
        onColorSelect={handleColorSelect}
        selectedColors={selectedColors}
        // maxSelections={10}
      />

      {selectedColors.length > 0 && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          minWidth: '200px'
        }}>
          <h3 style={{ marginBottom: '10px', color: '#374151' }}>
            Selected Colors ({selectedColors.length}):
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {selectedColors.map((color) => (
              <div key={color} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                background: '#f3f4f6',
                borderRadius: '6px',
                fontSize: '12px'
              }}>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white' // colorNameToColor[color]
                  }}
                />
                <span style={{ fontWeight: '500', color: '#1f2937' }}>
                  {color}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#374151' }}>
          Features:
        </h3>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px'
        }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
            <span>Text search functionality</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
            <span>Hover tooltips</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
            <span>Multi-select functionality</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
            <span>Hebrew & English search</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
            <span>Visual selection feedback</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
            <span>Compact professional design</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
            <span>All 60+ colors included</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
            <span>Smooth animations</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
            <span>Inline selected colors display</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
            <span>Toggle to show/hide picker</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
            <span>Individual color removal</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
            <span>Filter bar integration ready</span>
          </li>
        </ul>
      </div>
    </div>
  );
} 