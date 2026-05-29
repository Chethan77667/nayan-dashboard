import Link from "next/link";

type NayanRLogoProps = {
  href?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
};

const sizeMap = {
  sm: { icon: "h-9 w-9 text-sm", text: "text-lg", gap: "gap-2" },
  md: { icon: "h-11 w-11 text-base", text: "text-xl sm:text-2xl", gap: "gap-2.5" },
  lg: { icon: "h-14 w-14 text-xl", text: "text-2xl sm:text-3xl", gap: "gap-3" },
};

export default function NayanRLogo({
  href = "/",
  variant = "light",
  size = "md",
  showText = true,
}: NayanRLogoProps) {
  const s = sizeMap[size];
  const isLight = variant === "light";

  const content = (
    <span className={`inline-flex items-center ${showText ? s.gap : ""}`}>
      <span
        className={`${s.icon} flex shrink-0 items-center justify-center rounded-xl font-extrabold tracking-tighter transition-transform duration-300 ${
          isLight
            ? "bg-white text-indigo-700 shadow-lg"
            : "bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-md"
        }`}
        aria-label="Nayan R"
      >
        NR
      </span>
      {showText && (
        <span
          className={`${s.text} font-bold tracking-tight ${
            isLight ? "text-white" : "text-indigo-700"
          }`}
        >
          Nayan <span className={isLight ? "text-indigo-200" : "text-indigo-500"}>R</span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex transition opacity-95 hover:opacity-100">
        {content}
      </Link>
    );
  }

  return content;
}
