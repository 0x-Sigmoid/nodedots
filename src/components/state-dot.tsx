/**
 * Shared five-state dot: color always pairs with shape and label.
 * Consumed by the landing demo and the report viewer.
 */
export type DotState = "confirmed" | "missing" | "conflicting" | "uncertain" | "action";

export function StateDot({ state }: { state: DotState }) {
  return (
    <svg className={`state-dot state-${state}`} viewBox="0 0 20 20" aria-hidden="true">
      {state === "confirmed" ? (
        <circle cx="10" cy="10" r="6" fill="currentColor" />
      ) : state === "conflicting" ? (
        <>
          <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M4 16L16 4" stroke="currentColor" strokeWidth="2" />
        </>
      ) : state === "action" ? (
        <>
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="4" fill="currentColor" />
        </>
      ) : (
        <circle
          cx="10"
          cy="10"
          r="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={state === "uncertain" ? "3 3" : undefined}
        />
      )}
    </svg>
  );
}
