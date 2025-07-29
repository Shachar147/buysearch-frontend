'use client';

import React, { useState, useMemo } from 'react';
import { useAllColors, useColorConstants } from '../../api/color/queries';
import styles from './color-picker.module.css';

// Define the Color type based on backend data
export type Color = string;

// Define the backend color interface
interface BackendColor {
  id: number;
  name: string;
  hexCode?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the color constants interface
interface ColorConstants {
  colors: string[];
  colorNameToHex: Record<string, string>;
  colorGroups: Record<string, string[]>;
  searchKeywords: Record<string, { en: string[]; he: string[] }>;
  allKeywords: string[];
  colorSynonyms: Record<string, { en: string[]; he: string[] }>;
}

// Helper function to get hex color for a color name using backend data
const getColorHex = (colorName: string, hexCode?: string, colorConstants?: ColorConstants): string => {
  if (hexCode) return hexCode;
  if (colorConstants?.colorNameToHex[colorName]) {
    const colorOrPattern = colorConstants.colorNameToHex[colorName];
    if (colorOrPattern.startsWith('http')) {
      return `url(${colorOrPattern})`;
    }
    return colorOrPattern;
  }
  return '#CCCCCC'; // fallback
};

// Search function that uses backend search keywords
const matchesSearch = (colorName: string, searchTerm: string, colorConstants?: ColorConstants): boolean => {
  if (!colorConstants) return colorName.toLowerCase().includes(searchTerm.toLowerCase());
  
  const searchLower = searchTerm.toLowerCase();
  const colorLower = colorName.toLowerCase();
  
  // Direct name match
  if (colorLower.includes(searchLower)) {
    return true;
  }
  
  // Check search keywords from backend for this specific color
  const keywords = colorConstants.searchKeywords[colorName];
  if (keywords) {
    const allKeywords = [...keywords.en, ...keywords.he];
    // Check if any keyword contains the search term
    const keywordMatch = allKeywords.some(keyword => keyword.toLowerCase().includes(searchLower));
    return keywordMatch;
  }
  
  return false;
};

interface ColorPickerProps {
  onColorSelect?: (colors: Color[]) => void;
  selectedColors?: Color[];
  className?: string;
  maxSelections?: number;
}

export default function ColorPicker({ onColorSelect, selectedColors = [], className, maxSelections }: ColorPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSelectedColors, setLocalSelectedColors] = useState(selectedColors);
  
  // Fetch colors from backend
  const { data: backendColors = [], isLoading: isLoadingColors, error: colorsError } = useAllColors();
  
  // Fetch color constants from backend
  const { data: colorConstants, isLoading: isLoadingConstants, error: constantsError } = useColorConstants();

  // Convert backend colors to simple array of color names
  const allColors = useMemo(() => {
    return backendColors.map((color: BackendColor) => color.name);
  }, [backendColors]);

  // Categorize colors using backend colorGroups and add unmapped group
  const categorizeColors = (colors: string[], constants?: ColorConstants) => {
    if (!constants) {
      // Fallback categorization if constants not loaded
      return {
        unmapped: colors
      };
    }

    const categories: Record<string, string[]> = {
      reds: [],
      pinks: [],
      oranges: [],
      yellows: [],
      greens: [],
      blues: [],
      purples: [],
      neutrals: [],
      browns: [],
      denims: [],
      patterns: [],
      finishes: [],
      special: [],
      unmapped: [] // New group for unmapped colors
    };

    // Create a set of all mapped colors for quick lookup
    const mappedColors = new Set<string>();
    Object.values(constants.colorGroups).forEach(groupColors => {
      groupColors.forEach(color => mappedColors.add(color));
    });

    // First, categorize existing colors from backend
    colors.forEach(color => {
      let categorized = false;
      
      // Check if color is in any of the predefined groups
      Object.entries(constants.colorGroups).forEach(([groupName, groupColors]) => {
        if (groupColors.includes(color)) {
          categories[groupName].push(color);
          categorized = true;
        }
      });
      
      // If not categorized, add to unmapped group
      if (!categorized) {
        categories.unmapped.push(color);
      }
    });

    // Then, add mapped colors that are not in the current colors array
    Object.entries(constants.colorGroups).forEach(([groupName, groupColors]) => {
      groupColors.forEach(color => {
        if (!colors.includes(color)) {
          categories[groupName].push(color);
        }
      });
    });

    return categories;
  };

  const colorCategories = useMemo(() => categorizeColors(allColors, colorConstants), [allColors, colorConstants]);

  const filteredColors = useMemo(() => {
    if (!searchTerm.trim()) {
      // Return organized colors when no search
      return Object.values(colorCategories).flat();
    }
    
    if (!colorConstants) {
      // Fallback to simple search if constants not loaded
      return allColors.filter(color => color.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Search through ALL colors that have matching keywords, not just allColors
    const matchingColors = new Set<string>();
    
    // First, check colors in allColors
    allColors.forEach(color => {
      if (matchesSearch(color, searchTerm, colorConstants)) {
        matchingColors.add(color);
      }
    });
    
    // Then, check ALL colors in searchKeywords to find matches
    Object.entries(colorConstants.searchKeywords).forEach(([colorName, keywords]) => {
      const typedKeywords = keywords as { en: string[]; he: string[] };
      const allKeywords = [...typedKeywords.en, ...typedKeywords.he];
      const searchLower = searchTerm.toLowerCase();
      
      // Check if any keyword contains the search term
      if (allKeywords.some(keyword => keyword.toLowerCase().includes(searchLower))) {
        matchingColors.add(colorName);
      }
    });
    
    const filtered = Array.from(matchingColors);
    
    return filtered;
  }, [searchTerm, allColors, colorCategories, colorConstants]);

  const handleColorClick = (color: Color) => {
    const newSelectedColors = localSelectedColors.includes(color)
      ? localSelectedColors.filter(c => c !== color)
      : [...localSelectedColors, color];
    
    // Respect maxSelections limit
    const finalColors = maxSelections 
      ? newSelectedColors.slice(0, maxSelections)
      : newSelectedColors;
    
    setLocalSelectedColors(finalColors);
    onColorSelect?.(finalColors);
  };

  const handleClearSelection = () => {
    setLocalSelectedColors([]);
    onColorSelect?.([]);
  };

  const handleRemoveColor = (colorToRemove: Color) => {
    const newSelectedColors = localSelectedColors.filter(c => c !== colorToRemove);
    onColorSelect?.(newSelectedColors);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const isSelected = (color: Color) => localSelectedColors.includes(color);

  const renderColorSection = (title: string, colors: Color[]) => {
    const sectionColors = colors.filter(color => 
      !searchTerm.trim() || filteredColors.includes(color)
    );
    
    if (sectionColors.length === 0) return null;

    return (
      <div key={title} className={styles.colorSection}>
        <h4 className={styles.sectionTitle}>{title}</h4>
        <div className={styles.sectionColors}>
          {sectionColors.map((color) => {
            const backendColor = backendColors.find((bc: BackendColor) => bc.name === color);
            return (
              <div
                key={color}
                className={`${styles.colorSwatch} ${isSelected(color) ? styles.selected : ''}`}
                style={{ background: getColorHex(color, backendColor?.hexCode, colorConstants) }}
                onClick={() => handleColorClick(color)}
                title={color}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.colorPicker} ${className || ''}`}>
      {/* Combined Selected Colors Display and Toggle */}
      <div 
        className={`${styles.selectedColorsContainer} ${styles.clickable}`}
        onClick={toggleExpanded}
      >
        {selectedColors.length === 0 ? (
          <div className={styles.noColorsSelected}>
            <span>All</span>
            <span className={styles.toggleArrow}/>
          </div>
        ) : selectedColors.length === 1 ? (
          <div className={styles.singleColorSelected}>
            <span className={styles.selectedColorText}>{selectedColors[0]}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveColor(selectedColors[0]);
              }}
              className={styles.removeColorButton}
              type="button"
              title={`Remove ${selectedColors[0]}`}
            >
              ×
            </button>
          </div>
        ) : selectedColors.length === 2 ? (
          <div className={styles.twoColorsSelected}>
            <span className={styles.selectedColorText}>
              {selectedColors[0]}, {selectedColors[1]}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearSelection();
              }}
              className={styles.removeColorButton}
              type="button"
              title="Clear all colors"
            >
              ×
            </button>
          </div>
        ) : (
          <div className={styles.multipleColorsSelected}>
            <span className={styles.selectedColorText}>
              {selectedColors.length} Colors
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearSelection();
              }}
              className={styles.removeColorButton}
              type="button"
              title="Clear all colors"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Expandable Color Picker */}
      {isExpanded && (
        <div className={styles.expandableContent}>
          {(isLoadingColors || isLoadingConstants) && (
            <div className={styles.loading}>
              Loading colors...
            </div>
          )}
          
          {(colorsError || constantsError) && (
            <div className={styles.error}>
              Error loading colors. Please try again.
            </div>
          )}
          
          {!isLoadingColors && !isLoadingConstants && !colorsError && !constantsError && (
            <>
              <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search colors (e.g., כסוף, yellow, red)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {selectedColors.length > 0 && (
              <div className={styles.selectedCount}>
                {selectedColors.length}{maxSelections && `/${maxSelections}`} selected
              </div>
            )}
            {selectedColors.length > 0 && (
              <button 
                onClick={handleClearSelection}
                className={styles.clearButton}
                type="button"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className={styles.colorsContainer}>
            {searchTerm.trim() ? (
              // Show filtered results in grid when searching
              <div className={styles.colorsGrid}>
                {filteredColors.map((color) => {
                  const backendColor = backendColors.find((bc: BackendColor) => bc.name === color);
                  return (
                    <div
                      key={color}
                      className={`${styles.colorSwatch} ${isSelected(color) ? styles.selected : ''}`}
                      style={{ background: getColorHex(color, backendColor?.hexCode, colorConstants) }}
                      onClick={() => handleColorClick(color)}
                      title={color}
                    />
                  );
                })}
              </div>
            ) : (
              // Show organized sections when not searching
              <div className={styles.colorSections}>
                {/* Render all groups from backend in their original order */}
                {Object.entries(colorCategories).map(([groupName, colors]) => {
                  // Skip unmapped if empty, otherwise render all groups
                  if (groupName === 'unmapped' && colors.length === 0) return null;
                  
                  // Capitalize first letter for display
                  const displayName = groupName.charAt(0).toUpperCase() + groupName.slice(1);
                  return renderColorSection(displayName, colors);
                })}
              </div>
            )}
          </div>
          
          {filteredColors.length === 0 && searchTerm.trim() && (
            <div className={styles.noResults}>
              No colors found matching "{searchTerm}"
            </div>
          )}
            </>
          )}
        </div>
      )}
    </div>
  );
} 