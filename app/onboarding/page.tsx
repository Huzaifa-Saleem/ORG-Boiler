import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, requireAuth } from "@/lib/auth-utils";
import OrganizationForm from "./components/organization-form";

export const metadata: Metadata = {
  title: "Create Organization | Organization App",
  description: "Create your first organization",
};

export default async function OnboardingPage() {
  const session = await requireAuth();
  const user = await getCurrentUser();
  
  // If user already has organizations, redirect to dashboard
  if (user?.memberships && user.memberships.length > 0) {
    redirect("/dashboard");
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create your organization</h1>
          <p className="mt-2 text-sm text-gray-600">
            Set up your first organization to get started
          </p>
        </div>
        
        <OrganizationForm userId={user?.id || ""} />
      </div>
    </div>
  );
}
