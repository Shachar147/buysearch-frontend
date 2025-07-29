'use client';

import React, { useState } from 'react';
import ColorPicker, { Color } from '../../components/color-picker/color-picker';

// Import the color mapping from the component
const colorNameToColor: Record<Color, string> = {
  // Basic Colors
  [Color.BLACK]: '#000000',
  [Color.WHITE]: '#FFFFFF',
  [Color.RED]: 'var(--bs-red-5)',
  [Color.BLUE]: '#0000FF',
  [Color.GREEN]: '#008000',
  [Color.YELLOW]: '#FFFF00',
  [Color.PINK]: '#FFC0CB',
  [Color.PURPLE]: '#800080',
  [Color.ORANGE]: '#FFA500',
  [Color.BROWN]: '#A52A2A',
  [Color.GREY]: '#808080',
  [Color.BEIGE]: '#F5F5DC',

  // Shades and Fashion Variants
  [Color.NAVY]: '#000080',
  [Color.LIGHT_BLUE]: '#ADD8E6',
  [Color.SKY_BLUE]: '#87CEEB',
  [Color.DARK_BLUE]: '#00008B',
  [Color.ROYAL_BLUE]: '#4169E1',
  [Color.SAGE]: '#9CAF88',
  [Color.TEAL]: '#008080',
  [Color.TURQUOISE]: '#40E0D0',
  [Color.MINT]: '#98FF98',
  [Color.OLIVE]: '#808000',
  [Color.KHAKI]: '#F0E68C',
  [Color.CAMEL]: '#C19A6B',
  [Color.MUSTARD]: '#FFDB58',
  [Color.CORAL]: '#FF7F50',
  [Color.SALMON]: '#FA8072',
  [Color.BORDEAUX]: '#800020',
  [Color.LAVENDER]: '#E6E6FA',
  [Color.LILAC]: '#C8A2C8',
  [Color.CHARCOAL]: '#36454F',
  [Color.IVORY]: '#FFFFF0',
  [Color.OFFWHITE]: '#F5F5F5',
  [Color.CREAM]: '#FFFDD0',
  [Color.TAUPE]: '#483C32',
  [Color.GOLD]: '#FFD700',
  [Color.SILVER]: '#C0C0C0',
  [Color.COPPER]: '#B87333',
  [Color.EMERLAD]: '#50C878',
  [Color.BABY_PINK]: '#FFB6C1',
  [Color.ROSE]: '#FF007F',
  [Color.TAN]: '#D2B48C',
  [Color.NUDE]: '#E3BC9A',
  [Color.BRONZE]: '#CD7F32',
  [Color.MOCHA]: "#967969",
  [Color.STONE]: "#888C8D",

  // Patterns (approximate or symbolic)
  [Color.STRIPED]: '#D3D3D3', // light grey placeholder
  [Color.FLORAL]: '#FFB6C1', // soft pink (feminine tone)
  [Color.CHECKED]: '#A9A9A9', // dark grey
  [Color.PLAID]: '#B22222', // firebrick red (common in plaid)
  [Color.CAMOUFLAGE]: '#78866B', // army green
  [Color.LEOPARD]: '#DAA520', // goldenrod
  [Color.ZEBRA]: '#FFFFFF', // white (symbolic)
  [Color.POLKA_DOT]: '#FFDAB9', // peach puff
  [Color.PINSTRIPE]: '#708090', // slate gray

  // Finishes
  [Color.SHINY]: '#E5E4E2', // platinum
  [Color.GLITTER]: '#D4AF37', // glittery gold

  // Denim Variants
  [Color.DENIM]: '#1560BD',
  [Color.LIGHT_DENIM]: '#5DADEC',
  [Color.DARK_DENIM]: '#0F3460',
  [Color.WASHED_DENIM]: '#7BA7BC',
  [Color.RIPPED_DENIM]: '#4A90E2',

  // Misc
  [Color.MULTICOLOR]: '#CCCCCC', // neutral placeholder
  [Color.METALLIC]: '#B0B0B0',
  [Color.TRANSPARENT]: '#FFFFFF00',
};

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
                    backgroundColor: colorNameToColor[color]
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