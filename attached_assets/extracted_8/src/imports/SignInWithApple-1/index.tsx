export default function SignInWithApple() {
  return (
    <div className="bg-white relative rounded-[100px] size-full" data-name="SignInWithApple">
      <div className="[word-break:break-word] content-stretch flex font-['SF_Pro_Text:Semibold',sans-serif] gap-[10px] items-center leading-[0] not-italic overflow-clip px-[40px] py-[14px] relative rounded-[inherit] size-full text-[17px] text-black tracking-[-0.408px] whitespace-nowrap">
        <div className="flex flex-col justify-center relative shrink-0">
          <p className="leading-[22px]">{`\u{1008FA}`}</p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0">
          <p className="leading-[22px]">Sign in with Apple</p>
        </div>
      </div>
      <div aria-hidden className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[100px]" />
    </div>
  );
}