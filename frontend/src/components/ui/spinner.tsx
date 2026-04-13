interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function Spinner({ size = 'md', color = 'primary-600' }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };
  
  return (
    <div
      className={`inline-block animate-spin rounded-full border-solid border-current border-r-transparent ${sizes[size]} text-${color}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}