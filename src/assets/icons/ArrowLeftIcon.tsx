type ArrowLeftIconProps = {
  width?: number;
  stroke?: string;
};

export function ArrowLeftIcon({ width = 16, stroke = "6b6375" }: ArrowLeftIconProps) {
  const color = stroke.startsWith("#") ? stroke : `#${stroke}`;
  return (
    <svg
      width={width}
      height={width}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M19 12H5M5 12l7 7M5 12l7-7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
