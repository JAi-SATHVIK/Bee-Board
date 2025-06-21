export const stickyNoteColors = [
  '#FFEB3B',
  '#FFCDD2',
  '#C8E6C9',
  '#BBDEFB',
  '#FFF9C4',
  '#D1C4E9',
  '#FFE0B2',
  '#B2DFDB',
  '#F8BBD0',
  '#DCEDC8'
];

export function getRandomColor() {
  return stickyNoteColors[Math.floor(Math.random() * stickyNoteColors.length)];
} 