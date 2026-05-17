import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({
  children
}) {
  const [dark, setDark] = useState(() => {
    const stored =
      localStorage.getItem(
        'mindcare_theme'
      );

    if (stored) {
      return stored === 'dark';
    }

    return window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      dark
    );

    localStorage.setItem(
      'mindcare_theme',
      dark ? 'dark' : 'light'
    );
  }, [dark]);

  useEffect(() => {
    const media = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );

    function handleChange(event) {
      const saved =
        localStorage.getItem(
          'mindcare_theme'
        );

      if (!saved) {
        setDark(event.matches);
      }
    }

    media.addEventListener(
      'change',
      handleChange
    );

    return () =>
      media.removeEventListener(
        'change',
        handleChange
      );
  }, []);

  const value = useMemo(
    () => ({
      dark,
      setDark,

      toggleDark: () =>
        setDark((current) => !current)
    }),

    [dark]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () =>
  useContext(ThemeContext);