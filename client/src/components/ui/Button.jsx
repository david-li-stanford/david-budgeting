import clsx from 'clsx'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
}

export default function Button({ children, variant = 'primary', className, type = 'button', disabled, onClick, size }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        variants[variant],
        size === 'sm' && 'text-sm px-3 py-1.5',
        size === 'lg' && 'text-base px-6 py-3',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  )
}
