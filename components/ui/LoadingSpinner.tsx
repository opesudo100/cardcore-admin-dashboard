type LoadingSpinnerProps = {
  className?: string;
};

export function LoadingSpinner({ className = "h-6 w-6 border-white/30 border-t-white" }: LoadingSpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full border-2 animate-spin ${className}`}
    />
  );
}

type LoadingContentProps = {
  label: string;
  spinnerClassName?: string;
};

export function LoadingContent({ label, spinnerClassName }: LoadingContentProps) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <LoadingSpinner className={spinnerClassName} />
      <span>{label}</span>
    </span>
  );
}
