import * as React from "react"

const Switch = React.forwardRef(({ className = "", checked, onCheckedChange, ...props }, ref) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange?.(!checked)}
    className={`inline-flex h-6 w-11 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
      checked ? 'bg-blue-600' : 'bg-gray-300'
    } ${className}`}
    {...props}
    ref={ref}
  >
    <span
      className={`block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
))
Switch.displayName = "Switch"

export { Switch }