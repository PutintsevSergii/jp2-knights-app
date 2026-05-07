export const designTokens = {
  color: {
    background: {
      app: "#f8fafc",
      surface: "#ffffff"
    },
    border: {
      subtle: "#d1d5db"
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
  },
  typography: {
    fontFamily: {
      web: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
    },
    size: {
      screenTitle: 28,
      sectionTitle: 20,
      body: 16,
      secondary: 14,
      label: 12,
      button: 16
    },
    lineHeight: {
      screenTitle: 34,
      sectionTitle: 28,
      body: 24,
      secondary: 20,
      label: 16,
      button: 20
    },
    weight: {
      regular: "400",
      medium: "500",
      bold: "700"
    }
  }
} as const;
