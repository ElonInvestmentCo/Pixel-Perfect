import SignInWithApple from "../imports/SignInWithApple/index";

export default function App() {
  return (
    <div className="size-full flex items-center justify-center bg-gray-100">
      <div style={{ width: 270, height: 50 }}>
        <SignInWithApple />
      </div>
    </div>
  );
}
