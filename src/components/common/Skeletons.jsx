/**
 * Reusable skeleton primitives for loading states.
 * All skeletons use animate-pulse for the shimmer effect.
 */

/** A single shimmering block */
export function SkeletonBlock({ className = "" }) {
  return (
    <div className={`animate-pulse bg-[#E5E7EB] rounded-xl ${className}`} />
  );
}

/** 3 stat cards — used on dashboards */
export function StatCardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4"
        >
          <div className="animate-pulse bg-[#E5E7EB] w-12 h-12 rounded-xl" />
          <div className="animate-pulse bg-[#E5E7EB] h-7 w-16 rounded-lg" />
          <div className="animate-pulse bg-[#E5E7EB] h-4 w-28 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/** N skeleton appointment rows — used on history & dashboard */
export function AppointmentRowSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex items-center gap-4"
        >
          <div className="animate-pulse bg-[#E5E7EB] w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="animate-pulse bg-[#E5E7EB] h-4 w-36 rounded-lg" />
            <div className="animate-pulse bg-[#E5E7EB] h-3 w-24 rounded-lg" />
            <div className="animate-pulse bg-[#E5E7EB] h-3 w-48 rounded-lg" />
          </div>
          <div className="animate-pulse bg-[#E5E7EB] h-8 w-24 rounded-xl flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** N skeleton doctor cards — used on patient dashboard */
export function DoctorCardSkeleton({ count = 2 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-6 border border-[#E5E7EB] space-y-4"
        >
          <div className="flex items-start gap-4">
            <div className="animate-pulse bg-[#E5E7EB] w-14 h-14 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="animate-pulse bg-[#E5E7EB] h-4 w-28 rounded-lg" />
              <div className="animate-pulse bg-[#E5E7EB] h-3 w-20 rounded-lg" />
              <div className="animate-pulse bg-[#E5E7EB] h-3 w-32 rounded-lg" />
            </div>
          </div>
          <div className="animate-pulse bg-[#E5E7EB] h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/** Inline spinner for inside buttons */
export function Spinner({ size = 16, className = "" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
