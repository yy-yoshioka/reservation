'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import Alert from '@/app/components/ui/Alert';
import Input from '@/app/components/ui/Input';
import Select from '@/app/components/ui/Select';
import Modal from '@/app/components/ui/Modal';
import Badge from '@/app/components/ui/Badge';
import { get } from '@/app/lib/api';
import { User } from '@/app/types';
import { useAuth } from '@/app/hooks/useAuth';

export default function UsersPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    phone: '',
  });
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'customer',
    phone: '',
    password: '',
    confirm_password: '',
  });
  const [formError, setFormError] = useState<Record<string, string>>({});

  // Redirect non-admin users
  useEffect(() => {
    if (user && role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, role, router]);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Normally you would fetch from the API
        // const response = await get<{
        //   data: User[];
        //   pagination: { totalPages: number }
        // }>('/api/users');

        // if (response.error) {
        //   setError(response.error);
        //   return;
        // }

        // if (response.data) {
        //   setUsers(response.data.data);
        //   setFilteredUsers(response.data.data);
        //   setTotalPages(response.data.pagination.totalPages);
        // }

        // Mock data for demonstration
        const mockUsers = [
          {
            id: '1',
            email: 'admin@example.com',
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
            phone: '123-456-7890',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
          {
            id: '2',
            email: 'staff@example.com',
            first_name: 'Staff',
            last_name: 'User',
            role: 'staff',
            phone: '123-456-7891',
            created_at: '2023-01-02T00:00:00Z',
            updated_at: '2023-01-02T00:00:00Z',
          },
          {
            id: '3',
            email: 'customer1@example.com',
            first_name: 'John',
            last_name: 'Doe',
            role: 'customer',
            phone: '123-456-7892',
            created_at: '2023-01-03T00:00:00Z',
            updated_at: '2023-01-03T00:00:00Z',
          },
          {
            id: '4',
            email: 'customer2@example.com',
            first_name: 'Jane',
            last_name: 'Smith',
            role: 'customer',
            phone: '123-456-7893',
            created_at: '2023-01-04T00:00:00Z',
            updated_at: '2023-01-04T00:00:00Z',
          },
          {
            id: '5',
            email: 'customer3@example.com',
            first_name: 'Alice',
            last_name: 'Johnson',
            role: 'customer',
            phone: '123-456-7894',
            created_at: '2023-01-05T00:00:00Z',
            updated_at: '2023-01-05T00:00:00Z',
          },
        ];

        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
        setTotalPages(1);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && role === 'admin') {
      fetchUsers();
    }
  }, [user, role]);

  // Apply filters when search query or role filter changes
  useEffect(() => {
    let result = [...users];

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.first_name.toLowerCase().includes(query) ||
          user.last_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (roleFilter) {
      result = result.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [searchQuery, roleFilter, users]);

  // Handle user edit
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
    });
    setIsEditModalOpen(true);
  };

  // Handle edit form input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError({});

    // Validate form
    const errors: Record<string, string> = {};

    if (!editForm.first_name) {
      errors.first_name = 'First name is required';
    }

    if (!editForm.last_name) {
      errors.last_name = 'Last name is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }

    setIsLoading(true);

    try {
      // Normally you would update via API
      // const response = await fetch(`/api/users/${selectedUser?.id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(editForm),
      // });

      // const data = await response.json();

      // if (!response.ok) {
      //   setError(data.error || 'Failed to update user');
      //   return;
      // }

      // For demonstration, update the user in local state
      if (selectedUser) {
        const updatedUsers = users.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                first_name: editForm.first_name,
                last_name: editForm.last_name,
                role: editForm.role,
                phone: editForm.phone,
              }
            : u
        );

        setUsers(updatedUsers);
        setSuccess('User updated successfully');

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }

      setIsEditModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new user form input changes
  const handleNewUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle new user form submission
  const handleNewUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError({});

    // Validate form
    const errors: Record<string, string> = {};

    if (!newUserForm.first_name) {
      errors.first_name = 'First name is required';
    }

    if (!newUserForm.last_name) {
      errors.last_name = 'Last name is required';
    }

    if (!newUserForm.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newUserForm.email)) {
      errors.email = 'Email is invalid';
    }

    if (!newUserForm.password) {
      errors.password = 'Password is required';
    } else if (newUserForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (newUserForm.password !== newUserForm.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }

    setIsLoading(true);

    try {
      // Normally you would create via API
      // const response = await fetch('/api/users', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     first_name: newUserForm.first_name,
      //     last_name: newUserForm.last_name,
      //     email: newUserForm.email,
      //     role: newUserForm.role,
      //     phone: newUserForm.phone,
      //     password: newUserForm.password,
      //   }),
      // });

      // const data = await response.json();

      // if (!response.ok) {
      //   setError(data.error || 'Failed to create user');
      //   return;
      // }

      // For demonstration, add the new user to local state
      const newUser: User = {
        id: `${users.length + 1}`, // Mock ID
        first_name: newUserForm.first_name,
        last_name: newUserForm.last_name,
        email: newUserForm.email,
        role: newUserForm.role as 'admin' | 'staff' | 'customer',
        phone: newUserForm.phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUsers([...users, newUser]);
      setSuccess('User created successfully');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

      // Reset form
      setNewUserForm({
        first_name: '',
        last_name: '',
        email: '',
        role: 'customer',
        phone: '',
        password: '',
        confirm_password: '',
      });

      setIsNewUserModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'staff':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (!user || role !== 'admin') {
    return null; // Don't render anything while redirecting
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Button onClick={() => setIsNewUserModalOpen(true)}>Add New User</Button>
        </div>
        <p className="text-gray-500">
          Manage users of the reservation system. Add new users, edit existing ones, and change
          roles.
        </p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} className="mb-4">
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <Card.Content>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Search Users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email"
            />

            <Select
              label="Filter by Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: '', label: 'All Roles' },
                { value: 'admin', label: 'Admin' },
                { value: 'staff', label: 'Staff' },
                { value: 'customer', label: 'Customer' },
              ]}
            />

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('');
                }}
                className="mb-4"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Users Table */}
      <Card>
        <Card.Content>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Created
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                              {user.first_name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            {user.phone && (
                              <div className="text-sm text-gray-500">{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getRoleBadgeColor(user.role)}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No users found. Try adjusting your filters.
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Edit User Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="first_name"
              value={editForm.first_name}
              onChange={handleEditInputChange}
              error={formError.first_name}
              required
            />

            <Input
              label="Last Name"
              name="last_name"
              value={editForm.last_name}
              onChange={handleEditInputChange}
              error={formError.last_name}
              required
            />
          </div>

          <Input
            label="Email"
            name="email"
            value={editForm.email}
            disabled
            helperText="Email cannot be changed"
          />

          <Select
            label="Role"
            name="role"
            value={editForm.role}
            onChange={handleEditInputChange}
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'staff', label: 'Staff' },
              { value: 'customer', label: 'Customer' },
            ]}
          />

          <Input
            label="Phone"
            name="phone"
            value={editForm.phone}
            onChange={handleEditInputChange}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* New User Modal */}
      <Modal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        title="Add New User"
      >
        <form onSubmit={handleNewUserSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="first_name"
              value={newUserForm.first_name}
              onChange={handleNewUserInputChange}
              error={formError.first_name}
              required
            />

            <Input
              label="Last Name"
              name="last_name"
              value={newUserForm.last_name}
              onChange={handleNewUserInputChange}
              error={formError.last_name}
              required
            />
          </div>

          <Input
            label="Email"
            name="email"
            type="email"
            value={newUserForm.email}
            onChange={handleNewUserInputChange}
            error={formError.email}
            required
          />

          <Select
            label="Role"
            name="role"
            value={newUserForm.role}
            onChange={handleNewUserInputChange}
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'staff', label: 'Staff' },
              { value: 'customer', label: 'Customer' },
            ]}
          />

          <Input
            label="Phone"
            name="phone"
            value={newUserForm.phone}
            onChange={handleNewUserInputChange}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={newUserForm.password}
            onChange={handleNewUserInputChange}
            error={formError.password}
            required
          />

          <Input
            label="Confirm Password"
            name="confirm_password"
            type="password"
            value={newUserForm.confirm_password}
            onChange={handleNewUserInputChange}
            error={formError.confirm_password}
            required
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsNewUserModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
