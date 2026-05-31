import clsx from 'clsx'

const typeStyles = {
  savings:    'bg-sage/15 text-sage',
  brokerage:  'bg-amber/15 text-amber',
  retirement: 'bg-terracotta/15 text-terracotta',
  cd:         'bg-taupe text-warmGray',
  checking:   'bg-blue-50 text-blue-500',
  credit:     'bg-danger/10 text-danger',
}

const typeLabels = {
  savings:    'Savings',
  brokerage:  'Brokerage',
  retirement: 'Retirement',
  cd:         'CD',
  checking:   'Checking',
  credit:     'Credit',
}

export default function Badge({ type, className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        typeStyles[type] ?? 'bg-taupe text-warmGray',
        className
      )}
    >
      {typeLabels[type] ?? type}
    </span>
  )
}
