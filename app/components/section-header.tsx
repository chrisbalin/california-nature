import Image from "next/image";

export function SectionHeader({
  children,
  illustration,
}: {
  children: React.ReactNode;
  illustration?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {illustration && (
        <Image
          src={illustration}
          alt=""
          width={26}
          height={26}
          className="flex-shrink-0 object-contain illustration-diecut lg:hidden"
          aria-hidden="true"
        />
      )}
      <h2 className="text-sm font-normal text-stone-500 uppercase tracking-[0.2em] whitespace-nowrap">
        {children}
      </h2>
      <div className="flex-1 border-t border-stone-200" />
    </div>
  );
}
