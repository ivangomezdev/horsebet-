export default function Brand() {
  return (
    <span className="brand" aria-label="BetFury">
      <svg
        className="brand__mark"
        viewBox="0 0 48 44"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 20 5 4l14 8h10L43 4l-1 16 3 12-12 9H15L3 32Z"
          fill="#dce3ed"
          stroke="#697484"
          strokeWidth="2"
        />
        <path d="m8 8 9 7-8 4m31-11-9 7 8 4" fill="#ff174b" />
        <path d="m6 24 10-7 8 5 8-5 10 7-7 11-11-5-11 5Z" fill="#17202c" />
        <path d="m12 24 8 3-5 3m21-6-8 3 5 3" fill="white" />
        <path d="m19 32 5-3 5 3-5 5Z" fill="#10151d" />
      </svg>
      <span>
        BET<span className="brand__accent">FURY</span>
      </span>
    </span>
  );
}
