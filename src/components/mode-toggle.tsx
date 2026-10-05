import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "./theme-provider"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div 
      className="flex items-center space-x-1 border rounded-lg p-1 bg-slate-100 dark:bg-slate-800 dark:border-slate-700 shadow-inner"
      role="group"
      aria-label="Theme Toggle"
    >
      <button
        onClick={() => setTheme("light")}
        aria-label="Activate Light Mode"
        aria-pressed={theme === 'light'}
        className={`p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 ${
          theme === 'light' 
            ? 'bg-white shadow-sm text-blue-600 dark:bg-slate-700 dark:text-blue-400' 
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Light Mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        aria-label="Activate Dark Mode"
        aria-pressed={theme === 'dark'}
        className={`p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 ${
          theme === 'dark' 
            ? 'bg-white shadow-sm text-blue-600 dark:bg-slate-700 dark:text-blue-400' 
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Dark Mode"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        aria-label="Activate System Preference"
        aria-pressed={theme === 'system'}
        className={`p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 ${
          theme === 'system' 
            ? 'bg-white shadow-sm text-blue-600 dark:bg-slate-700 dark:text-blue-400' 
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="System Preference"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  )
}
