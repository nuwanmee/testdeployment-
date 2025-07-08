'use client';
import { useProfileStore } from '@/stores/profileStore';
import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function ApprovedProfilesPage() {
  const {
    approvedProfiles,
    fetchProfiles,
    loading,
    error
  } = useProfileStore();

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  if (loading) return <div className="p-4">Loading approved profiles...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Approved Profiles</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Approved Profiles
            <Badge variant="outline">{approvedProfiles.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {approvedProfiles.length > 0 ? (
            approvedProfiles.map((profile) => (
              <div key={profile.id} className="flex justify-between items-start p-4 border rounded-lg">
                <div className="space-y-2">
                  <h3 className="font-medium">{profile.user?.name}</h3>
                  {profile.user?.email && <p className="text-sm text-gray-600">{profile.user.email}</p>}
                  <div className="flex gap-4 text-sm text-gray-500">
                    <p>Approved: {profile.approvedAt ? format(new Date(profile.approvedAt), 'MMM dd, yyyy') : 'N/A'}</p>
                    <p>By: {profile.approvedBy || 'System'}</p>
                  </div>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No approved profiles found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}