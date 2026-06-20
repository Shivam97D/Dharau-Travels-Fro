import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

// Full-page / section loader — pulsing glow rings with a plane
export function TravelLoader({
  label,
  size = "md",
  className,
}: {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const wrap = { sm: "h-10 w-10", md: "h-16 w-16", lg: "h-24 w-24" }[size];
  const icon = { sm: "h-4 w-4", md: "h-7 w-7", lg: "h-11 w-11" }[size];

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className={cn("relative", wrap)}>
        {/* outer ping ring */}
        <span className="absolute inset-0 rounded-full gradient-sunset opacity-20 animate-ping [animation-duration:1.8s]" />
        {/* mid pulse ring */}
        <span className="absolute inset-2 rounded-full gradient-sunset opacity-30 animate-pulse" />
        {/* inner solid circle */}
        <span className="absolute inset-4 rounded-full gradient-sunset opacity-90" />
        {/* plane */}
        <span className="absolute inset-0 flex items-center justify-center">
          <Plane className={cn("text-white drop-shadow", icon)} style={{ transform: "rotate(-45deg)" }} />
        </span>
      </div>
      {label && (
        <p className="animate-pulse text-sm font-medium text-muted-foreground">
          {label}
        </p>
      )}
    </div>
  );
}

// Inline 3-dot loader for buttons and compact areas
export function TravelDots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-[3px]", className)}>
      {[0, 150, 300].map((d) => (
        <span
          key={d}
          className="block h-[5px] w-[5px] rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${d}ms`, animationDuration: "0.75s" }}
        />
      ))}
    </span>
  );
}

// Route-line loader — plane sliding along a dotted track (for page-level)
export function TravelRoute({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative h-1.5 w-48 overflow-hidden rounded-full bg-primary/15">
        <span
          className="absolute left-0 top-0 h-full w-12 rounded-full gradient-sunset animate-[slide_1.6s_ease-in-out_infinite]"
          style={{ animationTimingFunction: "cubic-bezier(0.4,0,0.6,1)" }}
        />
      </div>
      <style>{`
        @keyframes slide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
