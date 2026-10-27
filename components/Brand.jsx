export default function Brand() {
  return (
    <span className="brand" aria-label="HorseBet">
      <svg
        className="brand__mark"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M13 44c3-8 6-12 10-15l-9 5-8-6 7-13 8-6 3-7 5 7 7 3 6 11-2 21H13Z"
          fill="#392620"
          stroke="#edc19b"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="m28 8 8 4 6 11-2 21h-9l1-18-4-18Z" fill="#ff174b" />
        <path d="m22 10 6 2 7 10-5 7-9 3-7 2-8-6 7-13 9-5Z" fill="#bc743e" />
        <path d="m23 11 3 2-7 13-6 5-5-4 7-12 8-4Z" fill="#f2e4d5" />
        <path d="m13 25 8 3-6 5-8-5 6-3Z" fill="#8c512f" />
        <path d="m21 17 7 1-5 4-2-5Z" fill="#201a18" />
        <path d="m23 18 3 1-2 1-1-2Z" fill="white" />
        <path d="m23 8 1-4 2 5-3-1Z" fill="#f5cfaf" />
        <ellipse cx="11.8" cy="27.2" rx="1.6" ry="1.2" fill="#2e211c" />
        <path d="m31 33 6 5-1 6H20l11-11Z" fill="#a42a32" />
      </svg>
      <span>
        HORSE<span className="brand__accent">BET</span>
      </span>
    </span>
  );
}
