import clsx from 'clsx'

export default function Input({
  label,
  id,
  prefix,
  suffix,
  className,
  labelClassName,
  error,
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className={clsx('label', labelClassName)}>
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-warmGray text-sm select-none">{prefix}</span>
        )}
        <input
          id={id}
          className={clsx(
            'input-field',
            prefix && 'pl-7',
            suffix && 'pr-10'
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-warmGray text-sm select-none">{suffix}</span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}
