export const designTokens = {
  color: {
    brand: {
      gold: "#FECC00",
      goldPressed: "#F0C100",
      goldDark: "#745C00",
      goldDarker: "#6E5700",
      goldDeep: "#574500",
      ink: "#1A1B22",
      brown: "#4E4632",
      taupe: "#80765F",
      parchment: "#FBF8FF",
      linen: "#F4F2FD",
      line: "#D1C5AB",
      chromeLine: "#E3E1EC",
      softLine: "#EEEDF7"
    },
    background: {
      app: "#FBF8FF",
      surface: "#ffffff"
    },
    border: {
      subtle: "#D1C5AB",
      chrome: "#E3E1EC",
      soft: "#EEEDF7"
    },
    text: {
      primary: "#1A1B22",
      muted: "#4E4632",
      subdued: "#80765F",
      inverse: "#ffffff"
    },
    action: {
      primary: "#FECC00",
      primaryText: "#1A1B22",
      secondary: "#745C00",
      secondaryText: "#ffffff"
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
    md: 8,
    lg: 12,
    pill: 9999
  },
  elevation: {
    subtle: {
      color: "#000000",
      opacity: 0.05,
      offsetX: 0,
      offsetY: 1,
      radius: 2
    },
    raised: {
      color: "#000000",
      opacity: 0.1,
      offsetX: 0,
      offsetY: 4,
      radius: 6
    }
  },
  typography: {
    fontFamily: {
      mobile: "Work Sans",
      web: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
    },
    size: {
      display: 48,
      screenTitle: 32,
      sectionTitle: 24,
      cardTitle: 18,
      body: 16,
      secondary: 14,
      label: 12,
      button: 14
    },
    lineHeight: {
      display: 53,
      screenTitle: 38,
      sectionTitle: 31,
      cardTitle: 29,
      body: 24,
      secondary: 20,
      label: 12,
      compactLabel: 16,
      button: 14
    },
    weight: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700"
    },
    letterSpacing: {
      tight: 0,
      label: 0,
      compactLabel: 0,
      button: 0
    }
  }
} as const;
