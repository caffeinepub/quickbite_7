import { Heart } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="mt-auto border-t border-border/50 bg-card/50">
      <div className="container mx-auto flex flex-col items-center gap-2 px-4 py-8 text-center sm:flex-row sm:justify-between">
        <div className="flex items-center gap-1.5 text-muted-foreground font-body text-sm">
          <span className="font-display font-600 text-foreground">
            Quick<span className="text-primary">Bite</span>
          </span>
          <span>— Delicious food, delivered fast.</span>
        </div>
        <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
          © {year}. Built with{" "}
          <Heart className="inline h-3 w-3 text-primary fill-primary" /> using{" "}
          <a
            href={utmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
