export const pointsRules = [
  { id: 'hour-played', label: '1 oră jucată', points: 10 },
  { id: 'first-visit', label: 'Prima vizită', points: 50 },
  { id: 'five-visits', label: '5 vizite efectuate', points: 100 },
  { id: 'ten-hours', label: '10 ore jucate total', points: 150 },
  { id: 'pc-xbox', label: 'Joacă pe ambele (PC & Xbox)', points: 50 },
] as const;
