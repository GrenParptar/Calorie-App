// Boho palette: warm terracotta, sage, sand, cream, clay — earthy and soft.
export const colors = {
  background: '#F4E9DA',
  backgroundAlt: '#EDE0CC',
  card: '#FBF4E8',
  terracotta: '#C77B54',
  terracottaDark: '#A85D3A',
  sage: '#8A9A5B',
  sageLight: '#B7C29A',
  clay: '#D8A47F',
  rust: '#9C4A2B',
  sand: '#E8D5B7',
  cream: '#FFFBF2',
  ink: '#4A3C31',
  inkSoft: '#7A6A5C',
  gold: '#C9A24B',
  water: '#6C8FA3',
  waterLight: '#A9C4D1',
  success: '#7A8F5C',
  warning: '#D08A3E',
  border: '#DCC9AB',
};

export const gradients = {
  sunrise: ['#F4E9DA', '#E8C9A0'],
  clay: ['#D8A47F', '#C77B54'],
};

export const radii = {
  sm: 10,
  md: 18,
  lg: 28,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const, color: colors.ink },
  heading: { fontSize: 20, fontWeight: '700' as const, color: colors.ink },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.ink },
  caption: { fontSize: 13, fontWeight: '500' as const, color: colors.inkSoft },
  label: { fontSize: 12, fontWeight: '600' as const, color: colors.inkSoft, letterSpacing: 0.5 },
};

export const shadow = {
  soft: {
    shadowColor: colors.rust,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
};
