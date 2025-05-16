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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {organizations.map((org) => (
        <Link
          key={org.id}
          href={`/organizations/${org.id}/members`}
          className="block p-6 bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 hover:border-blue-200 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
              {org.role.charAt(0) + org.role.slice(1).toLowerCase()}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{org.name}</h2>
          <p className="mt-2 text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">
            {`organizations/${org.id}`}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm text-gray-500">View details</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      ))}
      
      {organizations.length === 0 && (
        <div className="col-span-full bg-white rounded-xl shadow-md p-10 text-center">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">You don't have any organizations yet.</p>
            <p className="text-gray-500 text-sm">Create your first organization to get started.</p>
          </div>
        </div>
      )}
    </div>
  );
}
