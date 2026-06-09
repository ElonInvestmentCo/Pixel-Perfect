function AppleLogo() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M13.284 10.575c-.022-2.268 1.853-3.368 1.937-3.42-1.057-1.546-2.7-1.757-3.28-1.778-1.392-.141-2.726.824-3.432.824-.714 0-1.804-.806-2.972-.783C3.99 5.44 2.5 6.374 1.682 7.828.013 10.764 1.24 15.15 2.847 17.558c.801 1.178 1.751 2.496 2.996 2.448 1.207-.049 1.66-.781 3.118-.781 1.45 0 1.868.781 3.135.756 1.298-.023 2.118-1.192 2.908-2.38a11.75 11.75 0 0 0 1.316-2.748c-.03-.013-2.52-.968-2.546-3.878ZM11.01 3.48C11.664 2.676 12.11 1.563 11.986.43c-.954.04-2.122.636-2.8 1.42-.607.698-1.143 1.843-.998 2.927 1.066.082 2.157-.543 2.822-1.297Z"
        fill="black"
      />
    </svg>
  );
}

export default function SignInWithApple() {
  return (
    <div className="bg-white relative rounded-[100px] size-full" data-name="SignInWithApple">
      <div className="[word-break:break-word] content-stretch flex font-['SF_Pro_Text:Semibold',sans-serif] gap-[10px] items-center leading-[0] not-italic overflow-clip px-[40px] py-[14px] relative rounded-[inherit] size-full text-[17px] text-black tracking-[-0.408px] whitespace-nowrap">
        <div className="flex flex-col justify-center relative shrink-0">
          <AppleLogo />
        </div>
        <div className="flex flex-col justify-center relative shrink-0">
          <p className="leading-[22px]">Sign in with Apple</p>
        </div>
      </div>
      <div aria-hidden className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[100px]" />
    </div>
  );
}