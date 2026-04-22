import clsx from 'clsx'

export default function Card({ children, className, onClick }) {
  return (
    <div
      className={clsx('card', onClick && 'cursor-pointer hover:shadow-card-hover transition-shadow duration-200', className)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
