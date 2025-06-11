const baseBg = "#27272a";
const baseText = "#ffffff";

const mantineTheme = {
  colorScheme: "dark",
  fontFamily: "var(--font-geist-sans), sans-serif",
  defaultRadius: "md",

  primaryColor: "gray", // ✅ set primary color
  primaryShade: 8,

  components: {
    Select: {
      styles: () => ({
        input: {
          backgroundColor: baseBg,
          color: baseText,
          border: "none",
          boxShadow: "none",
        },
      }),
    },
    Textarea: {
      styles: () => ({
        input: {
          backgroundColor: baseBg,
          color: baseText,
          border: "none",
          boxShadow: "none",
        },
      }),
    },
    DateTimePicker: {
      styles: () => ({
        input: {
          backgroundColor: baseBg,
          color: baseText,
          border: "none",
          boxShadow: "none",
        },
        dropdown: {
          backgroundColor: baseBg,
          color: baseText,
          border: "none",
        },
        calendarHeaderLevel: {
          color: "#000000",
        },
        day: {
          selected: {
            backgroundColor: "#3b82f6", // blue-500
            color: "#ffffff",
          },
        },
      }),
    },
  },
};

export default mantineTheme;
