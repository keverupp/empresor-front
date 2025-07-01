import { LoginForm } from "@/components/login-form";
import Header2 from "@/components/mvpblocks/header-2";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header2 />

      {/* Main Content */}
      <main className="flex-1 bg-muted flex items-center justify-center p-6 md:p-10 pt-20">
        <div className="w-full max-w-sm md:max-w-3xl">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
