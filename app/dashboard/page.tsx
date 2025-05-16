import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, requireAuth } from "@/lib/auth-utils";
import CreateOrgButton from "./components/create-org-button";
import OrganizationList from "./components/organization-list";

export const metadata: Metadata = {
  title: "Dashboard | Organization App",
  description: "Your organizations dashboard",
};

export default async function DashboardPage() {
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // If user has no organizations, redirect to onboarding
  if (user.memberships.length === 0) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Organizations</h1>
              <p className="text-gray-600 mt-1">Manage your organizations and teams</p>
            </div>
            <CreateOrgButton />
          </div>
        </div>

        <OrganizationList
          organizations={user.memberships.map((membership) => ({
            id: membership.org.id,
            name: membership.org.name,
            slug: membership.org.slug,
            role: membership.role,
          }))}
        />
      </div>
    </div>
  );
}
