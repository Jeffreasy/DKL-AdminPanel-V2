import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { DashboardData } from '@/api/types/dashboard.types';
import {
  UsersIcon,
  UserGroupIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  NewspaperIcon,
  CpuChipIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

// Metric Card Component
const MetricCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  color?: string;
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium truncate">{title}</dt>
            <dd className="text-lg font-medium">{value}</dd>
            {subtitle && <dd className="text-sm text-gray-500">{subtitle}</dd>}
          </dl>
        </div>
      </div>
    </div>
  );
};

// System Health Card
const SystemHealthCard = ({ health }: { health: DashboardData['system_health'] }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <CpuChipIcon className="h-8 w-8 text-gray-700 mr-3" />
        <h3 className="text-lg font-medium text-gray-900">System Health</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500">Uptime</div>
          <div className="text-lg font-medium">{health.uptime}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Rate Limiting</div>
          <div className="flex items-center">
            {health.rate_limit_status ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500 mr-1" />
            )}
            <span className="text-sm">{health.rate_limit_status ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Emails Sent</div>
          <div className="text-lg font-medium">{health.email_metrics.sent}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Emails Failed</div>
          <div className="text-lg font-medium text-red-600">{health.email_metrics.failed}</div>
        </div>
      </div>
    </div>
  );
};

// Recent Activity Component
const RecentActivityCard = ({ activities }: { activities: DashboardData['recent_activity'] }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <ClockIcon className="h-8 w-8 text-gray-700 mr-3" />
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500">New Users</div>
          <div className="text-lg font-medium">{activities.new_users}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">New Participants</div>
          <div className="text-lg font-medium">{activities.new_participants}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">New Contacts</div>
          <div className="text-lg font-medium">{activities.new_contacts}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Event Registrations</div>
          <div className="text-lg font-medium">{activities.event_registrations}</div>
        </div>
        <div className="col-span-2">
          <div className="text-sm text-gray-500">Emails Sent</div>
          <div className="text-lg font-medium">{activities.sent_emails}</div>
        </div>
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboardData,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-red-600">Failed to load dashboard data</p>
          <p className="text-sm text-gray-500">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of your system metrics and recent activity</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {/* Users */}
        <MetricCard
          title="Total Users"
          value={data.total_users}
          icon={UsersIcon}
          color="blue"
        />
        <MetricCard
          title="Active Users"
          value={data.active_users}
          icon={UsersIcon}
          subtitle={`${Math.round((data.active_users / data.total_users) * 100) || 0}% of total`}
          color="green"
        />

        {/* Participants */}
        <MetricCard
          title="Total Participants"
          value={data.total_participants}
          icon={UserGroupIcon}
          color="purple"
        />
        <MetricCard
          title="Active Participants"
          value={data.active_participants}
          icon={UserGroupIcon}
          subtitle={`${Math.round((data.active_participants / data.total_participants) * 100) || 0}% of total`}
          color="green"
        />

        {/* Events */}
        <MetricCard
          title="Total Events"
          value={data.total_events}
          icon={CalendarIcon}
          color="yellow"
        />
        <MetricCard
          title="Upcoming Events"
          value={data.upcoming_events}
          icon={CalendarIcon}
          color="blue"
        />
        <MetricCard
          title="Event Registrations"
          value={data.event_registrations}
          icon={CalendarIcon}
          color="green"
        />

        {/* Contacts */}
        <MetricCard
          title="Total Contacts"
          value={data.total_contacts}
          icon={ChatBubbleLeftIcon}
          color="blue"
        />
        <MetricCard
          title="Unanswered Contacts"
          value={data.unanswered_contacts}
          icon={ChatBubbleLeftIcon}
          subtitle={`${Math.round((data.unanswered_contacts / data.total_contacts) * 100) || 0}% unanswered`}
          color="red"
        />

        {/* Newsletters */}
        <MetricCard
          title="Total Newsletters"
          value={data.total_newsletters}
          icon={NewspaperIcon}
          color="purple"
        />
        <MetricCard
          title="Sent Newsletters"
          value={data.sent_newsletters}
          icon={NewspaperIcon}
          subtitle={`${Math.round((data.sent_newsletters / data.total_newsletters) * 100) || 0}% sent`}
          color="green"
        />
      </div>

      {/* System Health and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemHealthCard health={data.system_health} />
        <RecentActivityCard activities={data.recent_activity} />
      </div>
    </div>
  );
};