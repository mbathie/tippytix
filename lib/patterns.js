import * as heroPatterns from 'hero-patterns';

export const patterns = [
  { key: 'topography', label: 'Topography', fn: heroPatterns.topography },
  { key: 'texture', label: 'Texture', fn: heroPatterns.texture },
  { key: 'plus', label: 'Plus', fn: heroPatterns.plus },
  { key: 'polkaDots', label: 'Polka Dots', fn: heroPatterns.polkaDots },
  { key: 'hexagons', label: 'Hexagons', fn: heroPatterns.hexagons },
  { key: 'circuitBoard', label: 'Circuit Board', fn: heroPatterns.circuitBoard },
  { key: 'diagonalStripes', label: 'Diagonal Stripes', fn: heroPatterns.diagonalStripes },
  { key: 'overlappingCircles', label: 'Overlapping Circles', fn: heroPatterns.overlappingCircles },
  { key: 'morphingDiamonds', label: 'Morphing Diamonds', fn: heroPatterns.morphingDiamonds },
  { key: 'wiggle', label: 'Wiggle', fn: heroPatterns.wiggle },
  { key: 'fallingTriangles', label: 'Falling Triangles', fn: heroPatterns.fallingTriangles },
  { key: 'heavyRain', label: 'Heavy Rain', fn: heroPatterns.heavyRain },
  { key: 'leaf', label: 'Leaf', fn: heroPatterns.leaf },
  { key: 'endlessClouds', label: 'Endless Clouds', fn: heroPatterns.endlessClouds },
  { key: 'ticTacToe', label: 'Tic Tac Toe', fn: heroPatterns.ticTacToe },
  { key: 'glamorous', label: 'Glamorous', fn: heroPatterns.glamorous },
  { key: 'bubbles', label: 'Bubbles', fn: heroPatterns.bubbles },
  { key: 'connections', label: 'Connections', fn: heroPatterns.connections },
  { key: 'signal', label: 'Signal', fn: heroPatterns.signal },
  { key: 'fourPointStars', label: 'Four Point Stars', fn: heroPatterns.fourPointStars },
];

export function getPatternCSS(key, color, opacity = 0.07) {
  if (!key || key === 'none') return null;
  const p = patterns.find((p) => p.key === key);
  if (!p) return null;
  return p.fn(color, opacity);
}
