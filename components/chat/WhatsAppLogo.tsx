import Image from "next/image";

const LOGO_SRC = "/images/whatsapp-logo.png";

/** Official-style WhatsApp mark from project assets */
export default function WhatsAppLogo({
  size = 40,
  className = "",
  variant = "mark",
}: {
  size?: number;
  className?: string;
  /** mark = full logo image; icon = same, sized for small UI */
  variant?: "mark" | "phone-white" | "icon";
}) {
  if (variant === "phone-white") {
    return (
      <Image
        src={LOGO_SRC}
        alt=""
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        unoptimized
        aria-hidden
      />
    );
  }

  return (
    <Image
      src={LOGO_SRC}
      alt="WhatsApp"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      unoptimized
      priority={size >= 48}
    />
  );
}
