import './PageContainer.css'

/**
 * Reusable PageContainer component for TripSync.
 * Constrains layout width and guarantees consistent horizontal padding across viewports.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to be contained
 * @param {'default' | 'narrow' | 'wide'} [props.size='default'] - Width constraint preset
 * @param {keyof HTMLElementTagNameMap} [props.as='div'] - HTML element to render (e.g. 'div', 'main', 'section')
 * @param {string} [props.className=''] - Additional CSS classes
 */
export function PageContainer({
  children,
  size = 'default',
  as: Component = 'div',
  className = '',
  ...restProps
}) {
  const sizeClass = `ts-page-container--${size}`
  const combinedClassName = ['ts-page-container', sizeClass, className]
    .filter(Boolean)
    .join(' ')

  return (
    <Component className={combinedClassName} {...restProps}>
      {children}
    </Component>
  )
}

export default PageContainer
