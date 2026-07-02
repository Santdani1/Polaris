import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-accent">
          <Sparkles className="size-5 text-white" />
        </div>
        <div>
          <div className="text-lg font-semibold tracking-tight">POLARIS</div>
          <div className="text-xs text-muted">Tu SDR de seguros, trabajando 24/7</div>
        </div>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
