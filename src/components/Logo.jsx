// Marca: folha pautada com um traço de marca-texto.
export default function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#fffffe" />
      <rect x="0" y="0" width="64" height="64" rx="14" fill="none" stroke="#1b2a8a" strokeWidth="4" />
      <path d="M14 8v48" stroke="#ec7f86" strokeWidth="2.5" />
      <path d="M23 22h28M23 34h28M23 46h18" stroke="#aebbe8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 31c8 3 17 3 28-1" stroke="#ffe15a" strokeWidth="9" strokeLinecap="round" opacity="0.95" />
      <path d="M24 29h24" stroke="#1b2a8a" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  )
}
