import { Metadata } from "next";
import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import RegisterForm from "./components/register-form";

export const metadata: Metadata = {
  title: "Register | Organization App",
  description: "Create a new organization account",
};

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/auth/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </a>
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
