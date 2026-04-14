import { useState } from 'react';
import { Mail, Phone, MapPin, Camera, Edit2, Save } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

export function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const { showToast } = useUIStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: formData.name })
        .eq('id', user?.id);

      if (error) throw new Error(error.message);

      updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India',
        },
      });
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e3e6e6] py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0f1111]">Your Profile</h1>
          <p className="text-gray-500">Manage your account settings and preferences</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-32 h-32 rounded-full border-4 border-[#febd69]"
                  />
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-[#febd69] rounded-full flex items-center justify-center hover:bg-[#f90] transition-colors">
                    <Camera className="w-5 h-5 text-[#131921]" />
                  </button>
                </div>
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-gray-500">{user?.email}</p>
                <Badge className="mt-2 capitalize">{user?.role}</Badge>
                
                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{formData.phone || 'Not added'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{formData.city || 'Not added'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isSaving}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  {isEditing ? (
                    isSaving
                      ? <><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />Saving...</>
                      : <><Save className="w-4 h-4 mr-2" />Save</>
                  ) : (
                    <><Edit2 className="w-4 h-4 mr-2" />Edit</>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Street Address</Label>
                    <Input
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your street address"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        disabled={!isEditing}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        disabled={!isEditing}
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>PIN Code</Label>
                      <Input
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        disabled={!isEditing}
                        placeholder="PIN"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-gray-500">Update your account password</p>
                    </div>
                    <Button variant="outline">Change</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Manage your email preferences</p>
                    </div>
                    <Button variant="outline">Manage</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-600">Delete Account</p>
                      <p className="text-sm text-gray-500">Permanently delete your account</p>
                    </div>
                    <Button variant="outline" className="text-red-600 hover:bg-red-50">
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
