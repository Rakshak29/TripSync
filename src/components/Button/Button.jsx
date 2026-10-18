import './Button.css'

/**
 * Reusable Button component for TripSync.
 *
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'outline'} [props.variant='primary'] - Visual style variant
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Button size
 * @param {'button' | 'submit' | 'reset'} [props.type='button'] - Button HTML type
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {Function} [props.onClick] - Click handler function
 * @param {React.ReactNode} props.children - Button label or nested elements
 * @param {string} [props.className=''] - Additional custom CSS class names
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  ...restProps
}) {
  const variantClass = `ts-button--${variant}`
  const sizeClass = `ts-button--${size}`
  const combinedClassName = ['ts-button', variantClass, sizeClass, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={combinedClassName}
      {...restProps}
    >
      {children}
    </button>
  )
}

export default Button
