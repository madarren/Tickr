interface Props {
  message: string;
}

/**
 * Inline error shown directly below the ticker input. There is no separate
 * error page or routing — bad tickers simply render this banner in place.
 */
export default function ErrorBanner({ message }: Props) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700"
    >
      {message}
    </div>
  );
}
