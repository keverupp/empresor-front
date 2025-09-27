import Header2 from "@/components/mvpblocks/header-2";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header2 />
      <main className="flex-1 bg-muted flex items-center justify-center p-6 md:p-10 pt-20">
        <div className="w-full max-w-md">
          <ForgotPasswordForm />
        </div>
      </main>
    </div>
  );
}
