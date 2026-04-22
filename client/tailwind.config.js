/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF7F2',
        'cream-dark': '#F2EDE4',
        taupe: '#D6CFC4',
        'taupe-dark': '#B8AFA3',
        warmGray: '#9B9189',
        terracotta: '#C27B5A',
        'terracotta-light': '#D4957A',
        'terracotta-dark': '#A8623E',
        amber: '#D4A843',
        'amber-light': '#E8C06A',
        sage: '#7A8C6E',
        'sage-light': '#95A889',
        danger: '#B85C5C',
        'danger-light': '#CC7A7A',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '1rem',
        btn: '0.75rem',
      },
      boxShadow: {
        card: '0 2px 12px rgba(100, 80, 60, 0.08)',
        'card-hover': '0 4px 20px rgba(100, 80, 60, 0.14)',
        modal: '0 8px 40px rgba(100, 80, 60, 0.18)',
      },
    },
  },
  plugins: [],
}
