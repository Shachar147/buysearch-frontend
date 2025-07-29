'use client';

import React, { useState, useMemo } from 'react';
import styles from './color-picker.module.css';

// Copy of the Color enum and colorNameToColor mapping
export enum Color {
  // Basic Colors
  BLACK = "Black",
  WHITE = "White",
  RED = "Red",
  BLUE = "Blue",
  GREEN = "Green",
  YELLOW = "Yellow",
  PINK = "Pink",
  PURPLE = "Purple",
  ORANGE = "Orange",
  BROWN = "Brown",
  GREY = "Grey",
  BEIGE = "Beige",

  // Shades and Fashion Variants
  NAVY = "Navy",
  LIGHT_BLUE = "Light Blue",
  SKY_BLUE = "Sky Blue",
  DARK_BLUE = "Dark Blue",
  ROYAL_BLUE = "Royal Blue",
  SAGE = "Sage",
  TEAL = "Teal",
  TURQUOISE = "Turquoise",
  MINT = "Mint",
  OLIVE = "Olive",
  KHAKI = "Khaki",
  CAMEL = "Camel",
  MUSTARD = "Mustard",
  CORAL = "Coral",
  SALMON = "Salmon",
  BORDEAUX = "Bordeaux",
  LAVENDER = "Lavender",
  LILAC = "Lilac",
  CHARCOAL = "Charcoal",
  IVORY = "Ivory",
  OFFWHITE = "Off White",
  CREAM = "Cream",
  TAUPE = "Taupe",
  GOLD = "Gold",
  SILVER = "Silver",
  COPPER = "Copper",
  EMERLAD = "Emerlad",
  BABY_PINK = "Baby Pink",
  ROSE = "Rose",
  TAN = "Tan",
  NUDE = "Nude",
  BRONZE = "Bronze",
  MOCHA = "Mocha",
  STONE = "Stone",

  // Patterns
  STRIPED = "Stripped",
  FLORAL = "Floral",
  CHECKED = "Checked",
  PLAID = "Plaid",
  CAMOUFLAGE = "Camouflage",
  LEOPARD = "Leopard",
  ZEBRA = "Zebra",
  POLKA_DOT = "Polka Dot",
  PINSTRIPE = "Pinstripe",

  // Finishes
  SHINY = "Shiny",
  GLITTER = "Glitter",

  // Denim Variants
  DENIM = "Denim",
  LIGHT_DENIM = "Light Denim",
  DARK_DENIM = "Dark Denim",
  WASHED_DENIM = "Washed Denim",
  RIPPED_DENIM = "Ripped Denim",

  // Multi and Misc
  MULTICOLOR = "Multicolor",
  METALLIC = "Metallic",
  TRANSPARENT = "Transparent",
}

const colorNameToColor: Record<Color, string> = {
  // Basic Colors
  [Color.BLACK]: '#000000',
  [Color.WHITE]: '#FFFFFF',
  [Color.RED]: '#FF0000',
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

// Copy of COLOR_SEARCH_KEYWORDS_MAP from color.constants.ts
const COLOR_SEARCH_KEYWORDS_MAP: Record<Color, { en: string[]; he: string[] }> = {
  [Color.BLACK]: {
    en: ['black', 'ebony', 'onyx', 'coal', 'jet'],
    he: ['שחור', 'שחורה', 'שחורים', 'שחורות']
  },
  [Color.WHITE]: {
    en: ['white', 'ivory', 'cream', 'off-white', 'bone'],
    he: ['לבן', 'לבנה', 'לבנים', 'לבנות', 'שנהב', ' שמנת']
  },
  [Color.RED]: {
    en: ['red', 'crimson', 'scarlet', 'ruby', 'cherry'],
    he: ['אדום', 'אדומה', 'אדומים', 'אדומות', 'ארגמן']
  },
  [Color.BLUE]: {
    en: ['blue', 'azure', 'cobalt', 'indigo', 'sapphire'],
    he: ['כחול', 'כחולה', 'כחולים', 'כחולות', 'תכלת']
  },
  [Color.GREEN]: {
    en: ['green', 'emerald', 'jade', 'forest', 'mint'],
    he: ['ירוק', 'ירוקה', 'ירוקים', 'ירוקות', 'אמרלד']
  },
  [Color.YELLOW]: {
    en: ['yellow', 'golden', 'amber', 'lemon', 'canary'],
    he: ['צהוב', 'צהובה', 'צהובים', 'צהובות', 'זהב']
  },
  [Color.PINK]: {
    en: ['pink', 'rose', 'blush', 'fuchsia', 'magenta'],
    he: ['ורוד', 'ורודה', 'ורודים', 'ורודות', 'ורוד בהיר']
  },
  [Color.PURPLE]: {
    en: ['purple', 'violet', 'lavender', 'plum', 'amethyst'],
    he: ['סגול', 'סגולה', 'סגולים', 'סגולות', 'לילך']
  },
  [Color.ORANGE]: {
    en: ['orange', 'tangerine', 'peach', 'coral', 'apricot'],
    he: ['כתום', 'כתומה', 'כתומים', 'כתומות', 'אפרסק']
  },
  [Color.BROWN]: {
    en: ['brown', 'chocolate', 'coffee', 'caramel'],
    he: ['חום', 'חומה', 'חומים', 'חומות', 'שוקולד']
  },
  [Color.MOCHA]: {
    en: ['mocha', 'coffee'],
    he: [' מוקה'],
  },
  [Color.STONE]: {
    en: ['stone', 'grey', 'gray', 'silver', 'charcoal', 'slate'],
    he: ['אבן', 'אפור', 'אפורה', 'אפורים', 'אפורות', 'כסף']
  },
  [Color.GREY]: {
    en: ['grey', 'gray', 'silver', 'charcoal', 'slate'],
    he: ['אפור', 'אפורה', 'אפורים', 'אפורות', 'כסף']
  },
  [Color.BEIGE]: {
    en: ['beige', 'tan', 'nude', 'cream', 'ecru'],
    he: ['בז',]
  },
  [Color.NAVY]: {
    en: ['navy', 'navy blue', 'marine', 'midnight blue'],
    he: ['כחול כהה', 'כחול ימי', 'כחול חצות']
  },
  [Color.LIGHT_BLUE]: {
    en: ['light blue', 'sky blue', 'baby blue', 'powder blue'],
    he: ['כחול בהיר', 'כחול שמיים', 'כחול תינוק']
  },
  [Color.SKY_BLUE]: {
    en: ['sky blue', 'azure', 'celestial blue'],
    he: ['כחול שמיים', 'תכלת', 'כחול שמימי']
  },
  [Color.DARK_BLUE]: {
    en: ['dark blue', 'midnight', 'royal blue'],
    he: ['כחול כהה', 'כחול חצות', 'כחול מלכותי']
  },
  [Color.ROYAL_BLUE]: {
    en: ['royal blue', 'cobalt blue'],
    he: ['כחול מלכותי', 'כחול קובלט']
  },
  [Color.SAGE]: {
    en: ['sage', 'sage green', 'muted green'],
    he: ['מרווה', 'ירוק מרווה', 'ירוק עמום']
  },
  [Color.TEAL]: {
    en: ['teal', 'teal blue', 'blue green'],
    he: ['טורקיז כהה', 'כחול ירוק']
  },
  [Color.TURQUOISE]: {
    en: ['turquoise', 'aqua', 'cyan'],
    he: ['טורקיז', 'אקווה', 'ציאן']
  },
  [Color.MINT]: {
    en: ['mint', 'mint green', 'pastel green'],
    he: ['מנטה', 'ירוק מנטה', 'ירוק פסטל']
  },
  [Color.OLIVE]: {
    en: ['olive', 'olive green', 'army green'],
    he: ['זית', 'ירוק זית', 'ירוק צבאי']
  },
  [Color.KHAKI]: {
    en: ['khaki', 'beige green', 'military'],
    he: ['קאקי', 'בז ירוק', 'צבאי']
  },
  [Color.CAMEL]: {
    en: ['camel', 'tan', 'beige brown'],
    he: ['חום בהיר', 'בז חום', 'קאמל']
  },
  [Color.MUSTARD]: {
    en: ['mustard', 'yellow brown', 'golden yellow'],
    he: ['חרדל', 'צהוב חום', 'צהוב זהוב']
  },
  [Color.CORAL]: {
    en: ['coral', 'salmon pink', 'peach'],
    he: ['קורל', 'ורוד סלמון', 'אפרסק']
  },
  [Color.SALMON]: {
    en: ['salmon', 'pink orange', 'peach pink'],
    he: ['סלמון', 'כתום ורוד', 'אפרסק ורוד']
  },
  [Color.BORDEAUX]: {
    en: ['burgundy', 'wine', 'maroon', 'deep red', 'bordeaux', 'dark red', 'deep red', 'red'],
    he: ['בורגונדי', 'יין', 'אדום כהה', 'בורדו']
  },
  [Color.LAVENDER]: {
    en: ['lavender', 'light purple', 'lilac'],
    he: ['לילך', 'סגול בהיר', 'לילך']
  },
  [Color.LILAC]: {
    en: ['lilac', 'light purple', 'lavender'],
    he: ['לילך', 'סגול בהיר', 'לילך']
  },
  [Color.CHARCOAL]: {
    en: ['charcoal', 'dark grey', 'slate'],
    he: ['פחם', 'אפור כהה', 'צפחה']
  },
  [Color.IVORY]: {
    en: ['ivory', 'cream'],
    he: ['שנהב', 'לבן עמום', 'קרם']
  },
  [Color.OFFWHITE]: {
    en: ['off white', 'off-white', 'offwhite'],
    he: ['אוף וייט', 'אופייט', 'אופ וייט', 'אופויט', 'אוף ויט', 'לבן עמום', 'לבן דהוי', 'לבנבן', 'לבן בהיר'],
  },
  [Color.CREAM]: {
    en: ['cream', 'off white', 'ivory'],
    he: ['קרם', 'לבן עמום', 'שנהב']
  },
  [Color.TAUPE]: {
    en: ['taupe', 'grey brown', 'mushroom'],
    he: ['טאופ', 'אפור חום', 'פטריה']
  },
  [Color.GOLD]: {
    en: ['gold', 'golden', 'yellow gold'],
    he: ['זהב', 'זהוב', 'צהוב זהב']
  },
  [Color.SILVER]: {
    en: ['silver', 'metallic grey', 'platinum'],
    he: ['צבע כסף', 'אפור מתכתי', 'פלטינה', 'כסוף']
  },
  [Color.COPPER]: {
    en: ['copper', 'orange brown', 'rust'],
    he: ['נחושת', 'כתום חום', 'חלודה']
  },
  [Color.EMERLAD]: {
    en: ['emerald', 'green', 'jade'],
    he: ['אמרלד', 'ירוק', 'יהד']
  },
  [Color.BABY_PINK]: {
    en: ['baby pink', 'light pink', 'pastel pink'],
    he: ['ורוד בהיר', 'ורוד פסטל']
  },
  [Color.ROSE]: {
    en: ['rose', 'pink', 'blush'],
    he: ['ורוד', 'סומק']
  },
  [Color.TAN]: {
    en: ['tan', 'beige', 'nude'],
    he: ['חום בהיר', 'בז', 'עירום']
  },
  [Color.NUDE]: {
    en: ['nude', 'beige', 'skin tone'],
    he: ['עירום', 'בז', 'גוון עור']
  },
  [Color.BRONZE]: {
    en: ['bronze', 'brown gold', 'copper brown'],
    he: ['ארד', 'חום זהב', 'נחושת חום']
  },
  [Color.STRIPED]: {
    en: ['striped', 'stripes', 'pinstripe'],
    he: ['פסים', 'פסים דקים']
  },
  [Color.FLORAL]: {
    en: ['floral', 'flower', 'flowered'],
    he: ['פרחוני', 'פרחים']
  },
  [Color.CHECKED]: {
    en: ['checked', 'check', 'gingham'],
    he: ['משבצות', 'גינגהם']
  },
  [Color.PLAID]: {
    en: ['plaid', 'tartan', 'checkered'],
    he: ['קפלן', 'טאטן', 'משבצות']
  },
  [Color.CAMOUFLAGE]: {
    en: ['camouflage', 'camo', 'military'],
    he: ['הסוואה', 'קאמו', 'צבאי']
  },
  [Color.LEOPARD]: {
    en: ['leopard', 'animal print', 'wild'],
    he: ['נמר', 'פרינט חיות', 'פראי']
  },
  [Color.ZEBRA]: {
    en: ['zebra', 'animal print', 'black and white'],
    he: ['זברה', 'פרינט חיות', 'שחור לבן']
  },
  [Color.POLKA_DOT]: {
    en: ['polka dot', 'dots', 'spotted'],
    he: ['נקודות', 'מנוקד']
  },
  [Color.PINSTRIPE]: {
    en: ['pinstripe', 'thin stripes', 'striped'],
    he: ['פסים דקים', 'פסים']
  },
  [Color.SHINY]: {
    en: ['shiny', 'glossy', 'metallic'],
    he: ['מבריק', 'מתכתי']
  },
  [Color.GLITTER]: {
    en: ['glitter', 'sparkly', 'sequin'],
    he: ['נצנצים', 'מנצנץ', 'פאייטים']
  },
  [Color.DENIM]: {
    en: ['denim', 'jeans', 'blue denim'],
    he: ['דנים', 'גינס', 'דנים כחול']
  },
  [Color.LIGHT_DENIM]: {
    en: ['light denim', 'washed denim', 'light blue denim'],
    he: ['דנים בהיר', 'דנים כבוס', 'דנים כחול בהיר']
  },
  [Color.DARK_DENIM]: {
    en: ['dark denim', 'indigo denim', 'dark blue denim'],
    he: ['דנים כהה', 'דנים אינדיגו', 'דנים כחול כהה']
  },
  [Color.WASHED_DENIM]: {
    en: ['washed denim', 'distressed denim', 'vintage denim'],
    he: ['דנים כבוס', 'דנים שחוק', 'דנים וינטג']
  },
  [Color.RIPPED_DENIM]: {
    en: ['ripped denim', 'distressed denim', 'torn denim'],
    he: ['דנים קרוע', 'דנים שחוק', 'דנים קרוע']
  },
  [Color.MULTICOLOR]: {
    en: ['multicolor', 'colorful', 'rainbow'],
    he: ['רב צבעוני', 'צבעוני', 'קשת']
  },
  [Color.METALLIC]: {
    en: ['metallic', 'shiny', 'foil'],
    he: ['מתכתי', 'מבריק', 'נייר כסף']
  },
  [Color.TRANSPARENT]: {
    en: ['transparent', 'clear', 'see through'],
    he: ['שקוף']
  },
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

  // Color organization by shade and rainbow order
  const colorCategories = {
    // Rainbow order + neutrals
    reds: [Color.RED, Color.BORDEAUX, Color.CORAL, Color.SALMON, Color.ROSE],
    pinks: [Color.PINK, Color.BABY_PINK],
    oranges: [Color.ORANGE, Color.MUSTARD, Color.BRONZE, Color.COPPER],
    yellows: [Color.YELLOW, Color.GOLD],
    greens: [Color.GREEN, Color.SAGE, Color.TEAL, Color.TURQUOISE, Color.MINT, Color.OLIVE, Color.EMERLAD],
    blues: [Color.BLUE, Color.NAVY, Color.LIGHT_BLUE, Color.SKY_BLUE, Color.DARK_BLUE, Color.ROYAL_BLUE],
    purples: [Color.PURPLE, Color.LAVENDER, Color.LILAC],
    neutrals: [Color.BLACK, Color.WHITE, Color.GREY, Color.CHARCOAL, Color.BEIGE, Color.IVORY, Color.OFFWHITE, Color.CREAM, Color.TAUPE, Color.STONE],
    browns: [Color.BROWN, Color.KHAKI, Color.CAMEL, Color.TAN, Color.NUDE, Color.MOCHA],
    denims: [Color.DENIM, Color.LIGHT_DENIM, Color.DARK_DENIM, Color.WASHED_DENIM, Color.RIPPED_DENIM],
    patterns: [Color.STRIPED, Color.FLORAL, Color.CHECKED, Color.PLAID, Color.CAMOUFLAGE, Color.LEOPARD, Color.ZEBRA, Color.POLKA_DOT, Color.PINSTRIPE],
    finishes: [Color.SHINY, Color.GLITTER, Color.METALLIC],
    special: [Color.MULTICOLOR, Color.TRANSPARENT]
  };

  const filteredColors = useMemo(() => {
    const allColors = Object.values(Color);
    if (!searchTerm.trim()) {
      // Return organized colors when no search
      return Object.values(colorCategories).flat();
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = allColors.filter(color => {
      // Check color name
      if (color.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Check search keywords (English and Hebrew)
      const keywords = COLOR_SEARCH_KEYWORDS_MAP[color];
      if (keywords) {
        const allKeywords = [...keywords.en, ...keywords.he];
        return allKeywords.some(keyword => 
          keyword.toLowerCase().includes(searchLower)
        );
      }
      
      return false;
    });
    
    return filtered;
  }, [searchTerm]);

  const handleColorClick = (color: Color) => {
    const newSelectedColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    
    // Respect maxSelections limit
    const finalColors = maxSelections 
      ? newSelectedColors.slice(0, maxSelections)
      : newSelectedColors;
    
    onColorSelect?.(finalColors);
  };

  const handleClearSelection = () => {
    onColorSelect?.([]);
  };

  const handleRemoveColor = (colorToRemove: Color) => {
    const newSelectedColors = selectedColors.filter(c => c !== colorToRemove);
    onColorSelect?.(newSelectedColors);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const isSelected = (color: Color) => selectedColors.includes(color);

  const renderColorSection = (title: string, colors: Color[]) => {
    const sectionColors = colors.filter(color => 
      !searchTerm.trim() || filteredColors.includes(color)
    );
    
    if (sectionColors.length === 0) return null;

    return (
      <div key={title} className={styles.colorSection}>
        <h4 className={styles.sectionTitle}>{title}</h4>
        <div className={styles.sectionColors}>
          {sectionColors.map((color) => (
            <div
              key={color}
              className={`${styles.colorSwatch} ${isSelected(color) ? styles.selected : ''}`}
              style={{ backgroundColor: colorNameToColor[color] }}
              onClick={() => handleColorClick(color)}
              title={color}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.colorPicker} ${className || ''}`}>
      {/* Combined Selected Colors Display and Toggle */}
      <div 
        className={`${styles.selectedColorsContainer} ${styles.clickable}`}
        onClick={selectedColors.length > 0 ? undefined : toggleExpanded}
      >
        {selectedColors.length === 0 ? (
          <div className={styles.noColorsSelected}>
            <span>All</span>
            <span className={styles.toggleArrow}>
              ▼
            </span>
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
                {filteredColors.map((color) => (
                  <div
                    key={color}
                    className={`${styles.colorSwatch} ${isSelected(color) ? styles.selected : ''}`}
                    style={{ backgroundColor: colorNameToColor[color] }}
                    onClick={() => handleColorClick(color)}
                    title={color}
                  />
                ))}
              </div>
            ) : (
              // Show organized sections when not searching
              <div className={styles.colorSections}>
                {renderColorSection('Reds', colorCategories.reds)}
                {renderColorSection('Pinks', colorCategories.pinks)}
                {renderColorSection('Oranges', colorCategories.oranges)}
                {renderColorSection('Yellows', colorCategories.yellows)}
                {renderColorSection('Greens', colorCategories.greens)}
                {renderColorSection('Blues', colorCategories.blues)}
                {renderColorSection('Purples', colorCategories.purples)}
                {renderColorSection('Neutrals', colorCategories.neutrals)}
                {renderColorSection('Browns', colorCategories.browns)}
                {renderColorSection('Denims', colorCategories.denims)}
                {renderColorSection('Patterns', colorCategories.patterns)}
                {renderColorSection('Finishes', colorCategories.finishes)}
                {renderColorSection('Special', colorCategories.special)}
              </div>
            )}
          </div>
          
          {filteredColors.length === 0 && searchTerm.trim() && (
            <div className={styles.noResults}>
              No colors found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
} 