export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="border border-signal-risk/40 bg-signal-risktint px-3 py-2 text-sm text-signal-risk">
      {message}
    </p>
  );
}
