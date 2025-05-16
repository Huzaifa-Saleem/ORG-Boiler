import { Metadata } from "next";

import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import SignInForm from "./components/signin-form";

export const metadata: Metadata = {
  title: "Sign In | Organization App",
  description: "Sign in to your organization account",
};

export default async function SignInPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <a
              href="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </a>
          </p>
        </div>

        <SignInForm />
      </div>
    </div>
  );
}
