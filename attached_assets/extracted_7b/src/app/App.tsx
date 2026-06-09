export default function App() {
  return (
    <div className="size-full flex items-center justify-center bg-gray-100">
      <div className="w-[271px]">
        <SignInWithAppleButton />
      </div>
    </div>
  );
}

function AppleLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 814 1000"
      width="17"
      height="20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-150.3-109.7c-58.1-81.8-108.6-209.2-108.6-330.4 0-171.2 111.5-261.6 221-261.6 75.6 0 138.2 49.7 185.7 49.7 45.2 0 116.2-52.5 200.8-52.5zm-160-193.7c37.7-45.3 64.4-108.2 64.4-171.1 0-8.9-.6-17.9-2.1-26.2-61.1 2.3-134.1 41.5-178.5 93.2-34.1 38.2-66.5 101.7-66.5 165.3 0 9.5 1.6 19.1 2.3 22.1 3.8.6 10.2 1.3 16.5 1.3 55.3 0 122.4-37.2 164-84.6z" />
    </svg>
  );
}

function SignInWithAppleButton() {
  return (
    <div className="relative rounded-[100px] bg-white w-full" style={{ height: 50 }}>
      {/* Content row */}
      <div
        className="flex items-center justify-center gap-[10px] px-[40px] overflow-hidden rounded-[100px] size-full"
        style={{
          fontFamily: "-apple-system, 'SF Pro Text', BlinkMacSystemFont, sans-serif",
          fontWeight: 600,
          fontSize: 17,
          letterSpacing: "-0.408px",
          color: "#000",
          whiteSpace: "nowrap",
          lineHeight: "22px",
        }}
      >
        <AppleLogo />
        <span style={{ lineHeight: "22px" }}>Sign up with Apple</span>
      </div>
      {/* Border overlay */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-[100px] pointer-events-none"
        style={{ border: "1px solid #000" }}
      />
    </div>
  );
}
