import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group flex items-center gap-2 ${className}`}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-105 group-active:scale-95">
        <span className="text-xl font-bold">C</span>
        <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
      </div>
      <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 group-hover:to-primary transition-all">
        Chatly
      </span>
    </Link>
  );
}
