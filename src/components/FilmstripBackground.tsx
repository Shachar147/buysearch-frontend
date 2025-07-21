import React from "react";
import getSourceLogo from "../utils/source-logo";

const SOURCES = [
  "asos", "terminalx", "factory54", "itaybrands", "zara", "story", "oneprojectshop",
  "chozen", "nike", "jdsports", "gant", "renuar", "castro", "stockx", "tommy hilfiger",
  "alo yoga", "polo ralph lauren", "styleforrent"
];git s

export default function FilmstripBackground() {
  // Repeat the sources to make the filmstrip seamless
  const filmstripSources = [...SOURCES, ...SOURCES];

  return (
    <div className="filmstrip-bg">
      <div className="filmstrip-track">
        {filmstripSources.map((source, idx) => {
          const logo = getSourceLogo(source);
          return logo ? (
            <img
              key={source + idx}
              src={logo}
              alt={source}
              className="filmstrip-logo"
              draggable={false}
            />
          ) : null;
        })}
      </div>
      <div className="filmstrip-overlay" />
    </div>
  );
} 