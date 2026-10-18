/**
 * Reusable CompassLogo component for TripSync.
 * Renders a minimal, tasteful geometric compass mark as an SVG.
 *
 * @param {Object} props
 * @param {number} [props.size=28] - Pixel dimension for width and height
 * @param {string} [props.className=''] - Optional CSS class
 */
export function CompassLogo({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`ts-compass-logo ${className}`.trim()}
      aria-hidden="true"
    >
      {/* Outer compass ring */}
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5" />

      {/* Compass cardinal tick marks */}
      <line x1="12" y1="1.5" x2="12" y2="3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="20.5" x2="12" y2="22.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1.5" y1="12" x2="3.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20.5" y1="12" x2="22.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* North needle (solid fill) */}
      <polygon points="12,4.5 14.5,12 12,10.5 9.5,12" fill="currentColor" />

      {/* South needle (subtle fill) */}
      <polygon points="12,19.5 14.5,12 12,13.5 9.5,12" fill="currentColor" opacity="0.4" />

      {/* Center pivot point */}
      <circle cx="12" cy="12" r="1.25" fill="currentColor" />
    </svg>
  )
}

export default CompassLogo
