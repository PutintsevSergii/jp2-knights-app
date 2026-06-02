export const designTokens = {
  color: {
    brand: {
      gold: "#D6A21E",
      goldPressed: "#F6BE3C",
      goldDark: "#795900",
      goldDarker: "#5C4300",
      goldDeep: "#523B00",
      ink: "#1D1C16",
      brown: "#4F4634",
      taupe: "#817662",
      parchment: "#FEF9EF",
      linen: "#F2EDE3",
      line: "#D3C5AE",
      chromeLine: "#E7E2D8",
      softLine: "#ECE8DE"
    },
    background: {
      app: "#FEF9EF",
      surface: "#ffffff"
    },
    border: {
      subtle: "#D3C5AE",
      chrome: "#E7E2D8",
      soft: "#ECE8DE"
    },
    text: {
      primary: "#1D1C16",
      muted: "#4F4634",
      subdued: "#817662",
      inverse: "#ffffff"
    },
    action: {
      primary: "#D6A21E",
      primaryText: "#1D1C16",
      secondary: "#356382",
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
      mobile: "Inter",
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
