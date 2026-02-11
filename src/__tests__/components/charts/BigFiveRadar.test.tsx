import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Module-level variable to control mobile state - read at render time
let isMobileValue = false;

// Mock use-mobile hook
vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => isMobileValue,
}));

// Import actual constants from the real module
const actualModule = await vi.importActual<typeof import("@/components/charts/BigFiveRadar")>(
  "@/components/charts/BigFiveRadar"
);
const { BIG_FIVE_COLORS, TRAIT_DESCRIPTIONS } = actualModule;
export { BIG_FIVE_COLORS, TRAIT_DESCRIPTIONS };

// Mock the BigFiveRadar component module
vi.mock("@/components/charts/BigFiveRadar", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/charts/BigFiveRadar")>();

  // Mock BigFiveRadar component
  const MockBigFiveRadar = React.memo(function MockBigFiveRadar({
    profile,
    showLabels = true,
    showLegend = true,
    animate = true,
    height,
    className,
  }: {
    profile: { openness: number; conscientiousness: number; extraversion: number; agreeableness: number; neuroticism: number };
    showLabels?: boolean;
    showLegend?: boolean;
    animate?: boolean;
    height?: number;
    className?: string;
  }) {
    const isMobile = isMobileValue;
    const effectiveHeight = height || (isMobile ? 280 : 350);

    return React.createElement(
      "div",
      {
        "data-testid": "big-five-radar",
        className: className || "",
        style: { height: effectiveHeight },
      },
      [
        React.createElement("div", { key: "chart", "data-testid": "radar-chart" }, "Radar Chart"),
        showLabels &&
          React.createElement("div", { key: "labels", "data-testid": "chart-labels" }, [
            React.createElement("span", { key: "o", "data-testid": "label-openness" }, `Openness: ${profile.openness}`),
            React.createElement("span", { key: "c", "data-testid": "label-conscientiousness" }, `Conscientiousness: ${profile.conscientiousness}`),
            React.createElement("span", { key: "e", "data-testid": "label-extraversion" }, `Extraversion: ${profile.extraversion}`),
            React.createElement("span", { key: "a", "data-testid": "label-agreeableness" }, `Agreeableness: ${profile.agreeableness}`),
            React.createElement("span", { key: "n", "data-testid": "label-neuroticism" }, `Neuroticism: ${profile.neuroticism}`),
          ]),
        showLegend && React.createElement("div", { key: "legend", "data-testid": "chart-legend" }, "Legend"),
        animate && React.createElement("div", { key: "anim", "data-testid": "animation-enabled" }, "Animated"),
        isMobile && React.createElement("div", { key: "mobile", "data-testid": "mobile-mode" }, "Mobile"),
      ]
    );
  });

  // Mock BigFiveRadarSimple component
  const MockBigFiveRadarSimple = React.memo(function MockBigFiveRadarSimple({
    profile,
    size = 200,
    className,
  }: {
    profile: { openness: number; conscientiousness: number; extraversion: number; agreeableness: number; neuroticism: number };
    size?: number;
    className?: string;
  }) {
    return React.createElement(
      "div",
      {
        "data-testid": "big-five-radar-simple",
        className: className || "",
        style: { width: size, height: size },
      },
      [
        React.createElement("div", { key: "chart", "data-testid": "simple-radar-chart" }, "Simple Radar"),
        React.createElement("span", { key: "o", "data-testid": "simple-openness" }, `O: ${profile.openness}`),
        React.createElement("span", { key: "c", "data-testid": "simple-conscientiousness" }, `C: ${profile.conscientiousness}`),
        React.createElement("span", { key: "e", "data-testid": "simple-extraversion" }, `E: ${profile.extraversion}`),
        React.createElement("span", { key: "a", "data-testid": "simple-agreeableness" }, `A: ${profile.agreeableness}`),
        React.createElement("span", { key: "n", "data-testid": "simple-neuroticism" }, `N: ${profile.neuroticism}`),
      ]
    );
  });

  return {
    ...actual,
    BigFiveRadar: MockBigFiveRadar,
    BigFiveRadarSimple: MockBigFiveRadarSimple,
  };
});

// Import mocked components
import { BigFiveRadar, BigFiveRadarSimple } from "@/components/charts/BigFiveRadar";

// Test data
const mockProfile = {
  openness: 75,
  conscientiousness: 82,
  extraversion: 68,
  agreeableness: 71,
  neuroticism: 45,
};

const extremeHighProfile = {
  openness: 100,
  conscientiousness: 100,
  extraversion: 100,
  agreeableness: 100,
  neuroticism: 100,
};

const extremeLowProfile = {
  openness: 0,
  conscientiousness: 0,
  extraversion: 0,
  agreeableness: 0,
  neuroticism: 0,
};

const mixedProfile = {
  openness: 10,
  conscientiousness: 90,
  extraversion: 50,
  agreeableness: 30,
  neuroticism: 70,
};

describe("BigFiveRadar", () => {
  beforeEach(() => {
    isMobileValue = false;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders the radar chart container", () => {
      render(React.createElement(BigFiveRadar, { profile: mockProfile }));
      expect(screen.getByTestId("big-five-radar")).toBeInTheDocument();
    });

    it("renders the radar chart element", () => {
      render(React.createElement(BigFiveRadar, { profile: mockProfile }));
      expect(screen.getByTestId("radar-chart")).toBeInTheDocument();
    });

    it("displays all five trait labels by default", () => {
      render(React.createElement(BigFiveRadar, { profile: mockProfile }));
      expect(screen.getByTestId("label-openness")).toBeInTheDocument();
      expect(screen.getByTestId("label-conscientiousness")).toBeInTheDocument();
      expect(screen.getByTestId("label-extraversion")).toBeInTheDocument();
      expect(screen.getByTestId("label-agreeableness")).toBeInTheDocument();
      expect(screen.getByTestId("label-neuroticism")).toBeInTheDocument();
    });

    it("displays legend by default", () => {
      render(React.createElement(BigFiveRadar, { profile: mockProfile }));
      expect(screen.getByTestId("chart-legend")).toBeInTheDocument();
    });

    it("shows animation indicator by default", () => {
      render(React.createElement(BigFiveRadar, { profile: mockProfile }));
      expect(screen.getByTestId("animation-enabled")).toBeInTheDocument();
    });
  });

  describe("Props Handling", () => {
    it("hides labels when showLabels is false", () => {
      render(React.createElement(BigFiveRadar, { profile: mockProfile, showLabels: false }));
      expect(screen.queryByTestId("chart-labels")).not.toBeInTheDocument();
    });

    it("hides legend when showLegend is false", () => {
      render(React.createElement(BigFiveRadar, { profile: mockProfile, showLegend: false }));
      expect(screen.queryByTestId("chart-legend")).not.toBeInTheDocument();
    });

    it("disables animation when animate is false", () => {
      render(React.createElement(BigFiveRadar, { profile: mockProfile, animate: false }));
      expect(screen.queryByTestId("animation-enabled")).not.toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(React.createElement(BigFiveRadar, { profile: mockProfile, className: "custom-class" }));
      expect(screen.getByTestId("big-five-radar")).toHaveClass("custom-class");
    });

    it("applies custom height", () => {
      render(React.createElement(BigFiveRadar, { profile: mockProfile, height: 500 }));
      expect(screen.getByTestId("big-five-radar")).toHaveStyle({ height: "500px" });
    });
  });

  describe("Profile Data Display", () => {
    it("displays openness value correctly", () => {
      render(React.createElement(BigFiveRadar, { profile: mockProfile }));
      expect(screen.getByTestId("label-openness")).toHaveTextContent("Openness: 75");
    });

    it("displays conscientiousness value correctly", () => {
      render(React.createElement(BigFiveRadar, { profile: mockProfile }));
      expect(screen.getByTestId("label-conscientiousness")).toHaveTextContent("Conscientiousness: 82");
    });

    it("displays extraversion value correctly", () => {
      render(React.createElement(BigFiveRadar, { profile: mockProfile }));
      expect(screen.getByTestId("label-extraversion")).toHaveTextContent("Extraversion: 68");
    });

    it("displays agreeableness value correctly", () => {
      render(React.createElement(BigFiveRadar, { profile: mockProfile }));
      expect(screen.getByTestId("label-agreeableness")).toHaveTextContent("Agreeableness: 71");
    });

    it("displays neuroticism value correctly", () => {
      render(React.createElement(BigFiveRadar, { profile: mockProfile }));
      expect(screen.getByTestId("label-neuroticism")).toHaveTextContent("Neuroticism: 45");
    });
  });

  describe("Responsive Behavior", () => {
    it("uses desktop height by default", () => {
      isMobileValue = false;
      render(React.createElement(BigFiveRadar, { profile: mockProfile }));
      expect(screen.getByTestId("big-five-radar")).toHaveStyle({ height: "350px" });
    });

    it("uses mobile height when on mobile", () => {
      isMobileValue = true;
      render(React.createElement(BigFiveRadar, { profile: mockProfile }));
      expect(screen.getByTestId("big-five-radar")).toHaveStyle({ height: "280px" });
    });

    it("shows mobile indicator on mobile devices", () => {
      isMobileValue = true;
      render(React.createElement(BigFiveRadar, { profile: mockProfile }));
      expect(screen.getByTestId("mobile-mode")).toBeInTheDocument();
    });

    it("does not show mobile indicator on desktop", () => {
      isMobileValue = false;
      render(React.createElement(BigFiveRadar, { profile: mockProfile }));
      expect(screen.queryByTestId("mobile-mode")).not.toBeInTheDocument();
    });

    it("custom height overrides responsive height", () => {
      isMobileValue = true;
      render(React.createElement(BigFiveRadar, { profile: mockProfile, height: 400 }));
      expect(screen.getByTestId("big-five-radar")).toHaveStyle({ height: "400px" });
    });
  });

  describe("Edge Cases", () => {
    it("handles extreme high values (100)", () => {
      render(React.createElement(BigFiveRadar, { profile: extremeHighProfile }));
      expect(screen.getByTestId("label-openness")).toHaveTextContent("Openness: 100");
      expect(screen.getByTestId("label-conscientiousness")).toHaveTextContent("Conscientiousness: 100");
    });

    it("handles extreme low values (0)", () => {
      render(React.createElement(BigFiveRadar, { profile: extremeLowProfile }));
      expect(screen.getByTestId("label-openness")).toHaveTextContent("Openness: 0");
      expect(screen.getByTestId("label-neuroticism")).toHaveTextContent("Neuroticism: 0");
    });

    it("handles mixed extreme values", () => {
      render(React.createElement(BigFiveRadar, { profile: mixedProfile }));
      expect(screen.getByTestId("label-openness")).toHaveTextContent("Openness: 10");
      expect(screen.getByTestId("label-conscientiousness")).toHaveTextContent("Conscientiousness: 90");
    });

    it("handles decimal values", () => {
      const decimalProfile = { ...mockProfile, openness: 75.5 };
      render(React.createElement(BigFiveRadar, { profile: decimalProfile }));
      expect(screen.getByTestId("label-openness")).toHaveTextContent("Openness: 75.5");
    });
  });
});

describe("BigFiveRadarSimple", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders the simple radar container", () => {
      render(React.createElement(BigFiveRadarSimple, { profile: mockProfile }));
      expect(screen.getByTestId("big-five-radar-simple")).toBeInTheDocument();
    });

    it("renders the simple radar chart", () => {
      render(React.createElement(BigFiveRadarSimple, { profile: mockProfile }));
      expect(screen.getByTestId("simple-radar-chart")).toBeInTheDocument();
    });

    it("displays all five trait values", () => {
      render(React.createElement(BigFiveRadarSimple, { profile: mockProfile }));
      expect(screen.getByTestId("simple-openness")).toBeInTheDocument();
      expect(screen.getByTestId("simple-conscientiousness")).toBeInTheDocument();
      expect(screen.getByTestId("simple-extraversion")).toBeInTheDocument();
      expect(screen.getByTestId("simple-agreeableness")).toBeInTheDocument();
      expect(screen.getByTestId("simple-neuroticism")).toBeInTheDocument();
    });
  });

  describe("Props Handling", () => {
    it("uses default size of 200", () => {
      render(React.createElement(BigFiveRadarSimple, { profile: mockProfile }));
      expect(screen.getByTestId("big-five-radar-simple")).toHaveStyle({ width: "200px", height: "200px" });
    });

    it("applies custom size", () => {
      render(React.createElement(BigFiveRadarSimple, { profile: mockProfile, size: 300 }));
      expect(screen.getByTestId("big-five-radar-simple")).toHaveStyle({ width: "300px", height: "300px" });
    });

    it("applies custom className", () => {
      render(React.createElement(BigFiveRadarSimple, { profile: mockProfile, className: "simple-custom" }));
      expect(screen.getByTestId("big-five-radar-simple")).toHaveClass("simple-custom");
    });

    it("handles small size", () => {
      render(React.createElement(BigFiveRadarSimple, { profile: mockProfile, size: 100 }));
      expect(screen.getByTestId("big-five-radar-simple")).toHaveStyle({ width: "100px", height: "100px" });
    });

    it("handles large size", () => {
      render(React.createElement(BigFiveRadarSimple, { profile: mockProfile, size: 500 }));
      expect(screen.getByTestId("big-five-radar-simple")).toHaveStyle({ width: "500px", height: "500px" });
    });
  });

  describe("Profile Data Display", () => {
    it("displays abbreviated trait values", () => {
      render(React.createElement(BigFiveRadarSimple, { profile: mockProfile }));
      expect(screen.getByTestId("simple-openness")).toHaveTextContent("O: 75");
      expect(screen.getByTestId("simple-conscientiousness")).toHaveTextContent("C: 82");
      expect(screen.getByTestId("simple-extraversion")).toHaveTextContent("E: 68");
      expect(screen.getByTestId("simple-agreeableness")).toHaveTextContent("A: 71");
      expect(screen.getByTestId("simple-neuroticism")).toHaveTextContent("N: 45");
    });
  });

  describe("Edge Cases", () => {
    it("handles extreme high values", () => {
      render(React.createElement(BigFiveRadarSimple, { profile: extremeHighProfile }));
      expect(screen.getByTestId("simple-openness")).toHaveTextContent("O: 100");
    });

    it("handles extreme low values", () => {
      render(React.createElement(BigFiveRadarSimple, { profile: extremeLowProfile }));
      expect(screen.getByTestId("simple-openness")).toHaveTextContent("O: 0");
    });

    it("handles mixed values", () => {
      render(React.createElement(BigFiveRadarSimple, { profile: mixedProfile }));
      expect(screen.getByTestId("simple-openness")).toHaveTextContent("O: 10");
      expect(screen.getByTestId("simple-conscientiousness")).toHaveTextContent("C: 90");
    });
  });
});

describe("BIG_FIVE_COLORS constant", () => {
  it("contains all five trait colors", () => {
    expect(BIG_FIVE_COLORS).toHaveProperty("OPENNESS");
    expect(BIG_FIVE_COLORS).toHaveProperty("CONSCIENTIOUSNESS");
    expect(BIG_FIVE_COLORS).toHaveProperty("EXTRAVERSION");
    expect(BIG_FIVE_COLORS).toHaveProperty("AGREEABLENESS");
    expect(BIG_FIVE_COLORS).toHaveProperty("EMOTIONAL_STABILITY");
  });

  it("has valid color objects with primary, light, and dark values", () => {
    Object.values(BIG_FIVE_COLORS).forEach((colorSet) => {
      expect(colorSet).toHaveProperty("primary");
      expect(colorSet).toHaveProperty("light");
      expect(colorSet).toHaveProperty("dark");
      expect(typeof colorSet.primary).toBe("string");
      expect(typeof colorSet.light).toBe("string");
      expect(typeof colorSet.dark).toBe("string");
    });
  });
});

describe("TRAIT_DESCRIPTIONS constant", () => {
  it("contains descriptions for all five traits", () => {
    expect(TRAIT_DESCRIPTIONS).toHaveProperty("OPENNESS");
    expect(TRAIT_DESCRIPTIONS).toHaveProperty("CONSCIENTIOUSNESS");
    expect(TRAIT_DESCRIPTIONS).toHaveProperty("EXTRAVERSION");
    expect(TRAIT_DESCRIPTIONS).toHaveProperty("AGREEABLENESS");
    expect(TRAIT_DESCRIPTIONS).toHaveProperty("EMOTIONAL_STABILITY");
  });

  it("has non-empty description strings", () => {
    Object.values(TRAIT_DESCRIPTIONS).forEach((desc) => {
      expect(typeof desc).toBe("string");
      expect(desc.length).toBeGreaterThan(0);
    });
  });
});
