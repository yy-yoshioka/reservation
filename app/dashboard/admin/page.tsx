'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Alert from '@/app/components/ui/Alert';
import { get } from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';

// Types for admin dashboard statistics
interface AdminStats {
  totalUsers: number;
  totalReservations: number;
  newUsersThisMonth: number;
  reservationsThisMonth: number;
  reservationsByStatus: {
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
}

export default function AdminDashboardPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect non-admin users
  useEffect(() => {
    if (user && role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, role, router]);
  
  // Fetch admin dashboard statistics
  useEffect(() => {
    const fetchAdminStats = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real application, you would call an API to get these statistics
        // For now, we'll just simulate it with some mock data
        
        // const response = await get<{ data: AdminStats }>('/api/admin/stats');
        
        // if (response.error) {
        //   setError(response.error);
        //   return;
        // }
        
        // if (response.data) {
        //   setStats(response.data.data);
        // }
        
        // Mock data for demonstration
        setStats({
          totalUsers: 156,
          totalReservations: 342,
          newUsersThisMonth: 23,
          reservationsThisMonth: 84,
          reservationsByStatus: {
            pending: 12,
            confirmed: 45,
            cancelled: 8,
            completed: 19,
          },
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch admin statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && role === 'admin') {
      fetchAdminStats();
    }
  }, [user, role]);
  
  // Admin quick actions
  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View, edit or create new users',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      link: '/dashboard/admin/users',
    },
    {
      title: 'Manage Reservations',
      description: 'View and manage all reservations',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      link: '/dashboard/reservations',
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      link: '/dashboard/settings',
    },
  ];
  
  if (!user || role !== 'admin') {
    return null; // Don't render anything while redirecting
  }
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-500">
          Welcome to the admin dashboard. Here you can manage users, reservations, and view system statistics.
        </p>
      </div>
      
      {error && (
        <Alert
          variant="error"
          onClose={() => setError(null)}
          className="mb-6"
        >
          {error}
        </Alert>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          // Skeleton loaders for stats
          Array(4).fill(0).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </Card>
          ))
        ) : stats ? (
          <>
            <Card className="p-4">
              <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
              <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
              <p className="text-xs mt-1 text-green-600">
                +{stats.newUsersThisMonth} new this month
              </p>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-gray-500 text-sm font-medium">Total Reservations</h3>
              <p className="text-2xl font-bold mt-1">{stats.totalReservations}</p>
              <p className="text-xs mt-1 text-green-600">
                +{stats.reservationsThisMonth} this month
              </p>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-gray-500 text-sm font-medium">Confirmed Reservations</h3>
              <p className="text-2xl font-bold mt-1">{stats.reservationsByStatus.confirmed}</p>
              <p className="text-xs mt-1 text-gray-500">
                {Math.round((stats.reservationsByStatus.confirmed / (stats.reservationsByStatus.confirmed + stats.reservationsByStatus.pending + stats.reservationsByStatus.cancelled)) * 100)}% of total
              </p>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-gray-500 text-sm font-medium">Cancellation Rate</h3>
              <p className="text-2xl font-bold mt-1">
                {Math.round((stats.reservationsByStatus.cancelled / stats.totalReservations) * 100)}%
              </p>
              <p className="text-xs mt-1 text-gray-500">
                {stats.reservationsByStatus.cancelled} cancellations
              </p>
            </Card>
          </>
        ) : null}
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.link}>
              <Card className="p-6 hover:shadow-md transition-shadow h-full">
                <div className="flex flex-col items-center text-center h-full">
                  <div className="rounded-full bg-blue-100 p-3 mb-4 text-blue-600">
                    {action.icon}
                  </div>
                  <h3 className="text-lg font-medium mb-2">{action.title}</h3>
                  <p className="text-gray-500 text-sm">{action.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        
        <Card>
          <Card.Content>
            <div className="space-y-4">
              {isLoading ? (
                // Skeleton loaders for activity
                Array(5).fill(0).map((_, index) => (
                  <div key={index} className="flex animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-gray-200 mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : (
                // Mock data for demonstration
                [
                  { user: 'John Doe', action: 'created a new reservation', time: '5 minutes ago' },
                  { user: 'Jane Smith', action: 'cancelled their reservation', time: '2 hours ago' },
                  { user: 'Admin User', action: 'updated system settings', time: 'yesterday' },
                  { user: 'New User', action: 'registered an account', time: '2 days ago' },
                  { user: 'Admin User', action: 'added a new staff member', time: '3 days ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">
                      {activity.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card.Content>
        </Card>
      </div>
    </DashboardLayout>
  );
}