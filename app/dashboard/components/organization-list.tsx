"use client";

import Link from "next/link";
import { Role } from "@prisma/client";

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: Role;
}

interface OrganizationListProps {
  organizations: Organization[];
}

export default function OrganizationList({ organizations }: OrganizationListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {organizations.map((org) => (
        <Link
          key={org.id}
          href={`/organizations/${org.id}/members`}
          className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{org.name}</h2>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {org.role.charAt(0) + org.role.slice(1).toLowerCase()}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {`organizations/${org.id}`}
          </p>
        </Link>
      ))}
      
      {organizations.length === 0 && (
        <div className="col-span-full text-center py-10">
          <p className="text-gray-500">You don't have any organizations yet.</p>
        </div>
      )}
    </div>
  );
}
