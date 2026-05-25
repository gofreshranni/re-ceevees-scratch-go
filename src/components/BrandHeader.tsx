import { Link } from "@tanstack/react-router";
import logo from "@/assets/ceevees-logo.png";

export function BrandHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Ceevees Mart" className="h-10 w-auto" />
        </Link>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          🎒 Back to School
        </span>
      </div>
    </header>
  );
}
