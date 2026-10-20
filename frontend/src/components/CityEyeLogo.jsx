// CityEye Vector Logo - Ultra-crisp, high-contrast municipal surveillance eye with city silhouette
export default function CityEyeLogo({ size = 28, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Eye Contour with deep emerald fill and bold white stroke */}
      <path
        d="M2.5 16C5.5 9.5 10.5 6 16 6C21.5 6 26.5 9.5 29.5 16C26.5 22.5 21.5 26 16 26C10.5 26 5.5 22.5 2.5 16Z"
        fill="#065F46"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Iris Aperture Ring */}
      <circle cx="16" cy="16" r="6" stroke="#FFFFFF" strokeWidth="2" fill="#10B981" />
      {/* Center Camera Lens / Pupil */}
      <circle cx="16" cy="16" r="2.8" fill="#FFFFFF" />
      {/* City Skyline Silhouettes nestled inside lower half of eye */}
      <path
        d="M9 19.5V17H11.5V15H14.5V17.5H17.5V14H20.5V16.5H23V19.5"
        stroke="#FFFFFF"
        strokeWidth="1.3"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* Top / Bottom Radar Crosshair Ticks */}
      <path d="M16 2.5V4.5M16 27.5V29.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
