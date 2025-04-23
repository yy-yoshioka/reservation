'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Card from '@/app/components/ui/Card';
import Alert from '@/app/components/ui/Alert';
import { useAuth } from '@/app/hooks/useAuth';
import { useUser } from '@/app/hooks/useUser';

export default function SettingsPage() {
  const { user } = useAuth();
  const { getUserProfile, updateUserProfile, isLoading: userLoading } = useUser();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const userProfile = await getUserProfile();
        
        if (userProfile) {
          setFormData({
            first_name: userProfile.first_name || '',
            last_name: userProfile.last_name || '',
            email: user.email || '',
            phone: userProfile.phone || '',
          });
        }
      }
    };
    
    fetchUserProfile();
  }, [user, getUserProfile]);
  
  // Handle profile form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle password form input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle profile form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setSuccess(null);
    setError(null);
    
    try {
      const result = await updateUserProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      });
      
      if (result.success) {
        setSuccess('Profile updated successfully');
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setFormLoading(false);
    }
  };
  
  // Handle password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess(null);
    setPasswordError(null);
    
    // Validate passwords
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('Passwords do not match');
      setPasswordLoading(false);
      return;
    }
    
    if (passwordForm.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      setPasswordLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPasswordSuccess('Password updated successfully');
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
      } else {
        setPasswordError(data.error || 'Failed to update password');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'An unexpected error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
        <p className="text-gray-500">
          Manage your account settings and change your password.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <Card.Header>
            <Card.Title>Profile Information</Card.Title>
          </Card.Header>
          
          <Card.Content>
            {success && (
              <Alert
                variant="success"
                onClose={() => setSuccess(null)}
                className="mb-4"
              >
                {success}
              </Alert>
            )}
            
            {error && (
              <Alert
                variant="error"
                onClose={() => setError(null)}
                className="mb-4"
              >
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
                
                <Input
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                disabled
                helperText="Email cannot be changed"
              />
              
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={formLoading || userLoading}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
        
        {/* Change Password */}
        <Card>
          <Card.Header>
            <Card.Title>Change Password</Card.Title>
          </Card.Header>
          
          <Card.Content>
            {passwordSuccess && (
              <Alert
                variant="success"
                onClose={() => setPasswordSuccess(null)}
                className="mb-4"
              >
                {passwordSuccess}
              </Alert>
            )}
            
            {passwordError && (
              <Alert
                variant="error"
                onClose={() => setPasswordError(null)}
                className="mb-4"
              >
                {passwordError}
              </Alert>
            )}
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                required
              />
              
              <Input
                label="New Password"
                type="password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                helperText="Password must be at least 8 characters long"
                required
              />
              
              <Input
                label="Confirm New Password"
                type="password"
                name="confirm_password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
                required
              />
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={passwordLoading}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
        
        {/* Account Danger Zone */}
        <Card className="md:col-span-2">
          <Card.Header>
            <Card.Title>Danger Zone</Card.Title>
          </Card.Header>
          
          <Card.Content>
            <div className="border border-red-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-red-600 mb-2">Delete Account</h3>
              <p className="text-gray-700 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="danger">
                Delete Account
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    </DashboardLayout>
  );
}