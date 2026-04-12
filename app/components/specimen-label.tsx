import Image from "next/image";

interface SpecimenLabelProps {
  scientificName?: string;
  commonName: string;
  detail?: string;
  illustration?: string;
  illustrationSize?: number;
}

export function SpecimenLabel({
  scientificName,
  commonName,
  detail,
  illustration,
  illustrationSize = 56,
}: SpecimenLabelProps) {
  return (
    <div className="flex items-start gap-3">
      {illustration && (
        <Image
          src={illustration}
          alt={commonName}
          width={illustrationSize}
          height={illustrationSize}
          className="flex-shrink-0 object-contain illustration-diecut"
        />
      )}
      <div className="min-w-0">
        {scientificName && (
          <div className="text-sm italic text-stone-800">{scientificName}</div>
        )}
        <div className="text-sm text-stone-700">{commonName}</div>
        {detail && (
          <div className="text-xs text-stone-400">{detail}</div>
        )}
      </div>
    </div>
  );
}
