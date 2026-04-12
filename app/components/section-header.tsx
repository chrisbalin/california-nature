export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-sm font-normal text-stone-500 uppercase tracking-[0.2em] whitespace-nowrap">
        {children}
      </h2>
      <div className="flex-1 border-t border-stone-200" />
    </div>
  );
}
