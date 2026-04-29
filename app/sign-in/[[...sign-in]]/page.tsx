import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
                <SignIn 
                    appearance={{
                        elements: {
                            formButtonPrimary: 'bg-[#dfff4f] hover:bg-[#c9e647] text-black text-sm normal-case',
                        }
                    }}
                    fallbackRedirectUrl="/"
                />
    </div>
  );
}
