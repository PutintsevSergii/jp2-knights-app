export const designTokens = {
  color: {
    background: {
      app: "#f8fafc",
      surface: "#ffffff"
    },
    text: {
      primary: "#111827",
      muted: "#4b5563",
      inverse: "#ffffff"
    },
    action: {
      primary: "#1d4ed8",
      primaryText: "#ffffff"
    },
    status: {
      success: "#15803d",
      warning: "#a16207",
      danger: "#b91c1c"
    }
  },
  space: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    6: 24,
    8: 32
  },
  radius: {
    sm: 4,
    md: 8
  }
} as const;
