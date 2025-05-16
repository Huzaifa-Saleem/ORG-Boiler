"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import InviteMemberForm from "@/components/InviteMemberForm";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

export default function MembersPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch organization, members and pending invitations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch organization details
        const orgResponse = await fetch(`/api/organizations/${orgId}`);
        if (!orgResponse.ok) {
          throw new Error("Failed to fetch organization details");
        }
        const orgData = await orgResponse.json();
        setOrganization(orgData);
        
        // Fetch members
        const membersResponse = await fetch(`/api/organizations/${orgId}/members`);
        if (!membersResponse.ok) {
          throw new Error("Failed to fetch members");
        }
        const membersData = await membersResponse.json();
        setMembers(membersData);
        
        // Fetch pending invitations
        const invitesResponse = await fetch(`/api/organizations/${orgId}/invites`);
        if (!invitesResponse.ok) {
          throw new Error("Failed to fetch invitations");
        }
        const invitesData = await invitesResponse.json();
        setInvitations(invitesData);
        
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [orgId]);

  const refreshInvitations = async () => {
    if (!organization) return;
    
    try {
      const response = await fetch(`/api/organizations/${orgId}/invites`);
      if (!response.ok) {
        throw new Error("Failed to fetch invitations");
      }
      const data = await response.json();
      setInvitations(data);
    } catch (err: any) {
      console.error("Error refreshing invitations:", err);
    }
  };

  const cancelInvitation = async (inviteId: string) => {
    if (!organization) return;
    
    try {
      const response = await fetch(`/api/organizations/${orgId}/invites/${inviteId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to cancel invitation");
      }
      
      // Remove the invitation from the list
      setInvitations(invitations.filter(invite => invite.id !== inviteId));
    } catch (err: any) {
      console.error("Error cancelling invitation:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error || "Organization not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Team Members - {organization.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold mb-4">Current Members</h2>
            
            {members.length === 0 ? (
              <p className="text-gray-500">No members found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr key={member.id}>
                        <td className="px-4 py-3 whitespace-nowrap">{member.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{member.email}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.role === "ADMIN" 
                              ? "bg-purple-100 text-purple-800" 
                              : member.role === "SUBADMIN" 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-green-100 text-green-800"
                          }`}>
                            {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Pending Invitations</h2>
            
            {invitations.length === 0 ? (
              <p className="text-gray-500">No pending invitations.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invitations.map((invite) => (
                      <tr key={invite.id}>
                        <td className="px-4 py-3 whitespace-nowrap">{invite.email}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invite.role === "ADMIN" 
                              ? "bg-purple-100 text-purple-800" 
                              : invite.role === "SUBADMIN" 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-green-100 text-green-800"
                          }`}>
                            {invite.role.charAt(0) + invite.role.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invite.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button 
                            onClick={() => cancelInvitation(invite.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div className="md:col-span-1">
          <InviteMemberForm 
            organizationId={orgId} 
            onSuccess={refreshInvitations}
          />
        </div>
      </div>
    </div>
  );
}
