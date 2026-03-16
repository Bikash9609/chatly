import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

interface SkipMeterProps {
  skipCount: number;
  maxSkips?: number;
  cooldownSeconds?: number | null;
}

export function SkipMeter({ skipCount, maxSkips = 10, cooldownSeconds = null }: SkipMeterProps) {
  const percentage = Math.min((skipCount / maxSkips) * 100, 100);
  const isDanger = skipCount >= maxSkips - 2;

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-xs">
      <div className="flex justify-between items-center text-xs px-1">
        <span className="text-muted-foreground font-medium flex items-center gap-1">
          Skips Available
        </span>
        <span className={isDanger ? "text-destructive font-bold" : "text-muted-foreground font-medium"}>
          {maxSkips - skipCount} / {maxSkips}
        </span>
      </div>
      
      <Progress 
        value={100 - percentage} 
        className={`h-2 ${isDanger ? 'bg-destructive/20' : ''}`}
        // We invert it so full bar = 10 available, empty bar = 0 available
      />

      {cooldownSeconds !== null && cooldownSeconds > 0 && (
        <div className="flex flex-col gap-1 text-xs text-destructive mt-1 bg-destructive/10 p-2 rounded-md">
          <div className="flex items-center gap-1.5 ">
            <AlertCircle className="w-4 h-4" />
            <span>Limit hit! Wait {Math.ceil(cooldownSeconds / 60)}m or refill.</span>
          </div>
          <p className="text-[10px] opacity-70 ml-5.5">Click 'Skip' to watch an ad and refill.</p>
        </div>
      )}
    </div>
  );
}
