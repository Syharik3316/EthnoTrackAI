
"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" 

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
  // Props for compatibility with next-themes, can be ignored if not using it directly for system theme
  attribute?: string 
  enableSystem?: boolean
}

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "light", // Default to light if no localStorage or prop is set
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme", // Consistent key with shadcn/ui examples
  attribute = "class", // For next-themes compatibility, we manage class on <html>
  enableSystem = false, // Default to false for manual toggle
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return defaultTheme
    }
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme | null
      // For now, we don't implement system preference here directly,
      // but this is where you would check it if enableSystem was true
      // and no theme was stored.
      return storedTheme || defaultTheme
    } catch (e) {
      console.error("Error reading theme from localStorage", e)
      return defaultTheme
    }
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement
      
      root.classList.remove("light", "dark") // Remove previous theme
      
      if (theme) {
        root.classList.add(theme) // Add current theme
      }
      
      try {
        localStorage.setItem(storageKey, theme)
      } catch (e) {
        console.error("Error saving theme to localStorage", e)
      }
    }
  }, [theme, storageKey])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
