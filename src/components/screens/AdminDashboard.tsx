import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, TrendingUp, Users, MapPin } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const stats = [
    { label: 'Total Complaints', value: '247', change: '+12%', icon: FileText, color: 'bg-blue-500' },
    { label: 'Pending', value: '48', change: '-8%', icon: Clock, color: 'bg-amber-500' },
    { label: 'Resolved', value: '189', change: '+15%', icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Rejected', value: '10', change: '+2%', icon: XCircle, color: 'bg-red-500' },
  ];

  const recentComplaints = [
    {
      id: '1',
      title: 'Pothole on Main Street',
      category: 'Road Damage',
      status: 'in_progress',
      priority: 'high',
      location: 'Main Street, Zone A',
      time: '2 hours ago',
    },
    {
      id: '2',
      title: 'Street Light Not Working',
      category: 'Street Lights',
      status: 'under_review',
      priority: 'medium',
      location: 'Park Avenue, Zone B',
      time: '4 hours ago',
    },
    {
      id: '3',
      title: 'Garbage Overflow',
      category: 'Garbage',
      status: 'submitted',
      priority: 'critical',
      location: 'Market Road, Zone C',
      time: '6 hours ago',
    },
  ];

  const departmentStats = [
    { department: 'Roads & Infrastructure', pending: 18, inProgress: 12, resolved: 45 },
    { department: 'Water Supply', pending: 8, inProgress: 5, resolved: 32 },
    { department: 'Electricity', pending: 12, inProgress: 8, resolved: 28 },
    { department: 'Waste Management', pending: 10, inProgress: 6, resolved: 35 },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'default', label: string }> = {
      submitted: { variant: 'info', label: 'New' },
      under_review: { variant: 'warning', label: 'Reviewing' },
      in_progress: { variant: 'warning', label: 'In Progress' },
      resolved: { variant: 'success', label: 'Resolved' },
    };
    const config = variants[status] || { variant: 'default' as const, label: status };
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error'> = {
      low: 'success',
      medium: 'warning',
      high: 'warning',
      critical: 'error',
    };
    return <Badge variant={variants[priority]} size="sm">{priority.toUpperCase()}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white px-6 pt-8 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Profile
        </button>
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-purple-100">Manage complaints and monitor city services</p>
      </div>

      <div className="px-6 mt-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="p-4">
                  <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">{stat.change}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Complaints</h2>
          <div className="space-y-3">
            {recentComplaints.map((complaint) => (
              <Card key={complaint.id} hover className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{complaint.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{complaint.category}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{complaint.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(complaint.status)}
                    {getPriorityBadge(complaint.priority)}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span>{complaint.time}</span>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    View Details
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Workload</h2>
          <Card className="divide-y divide-gray-100">
            {departmentStats.map((dept, index) => (
              <div key={index} className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">{dept.department}</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Pending</p>
                    <p className="text-xl font-bold text-amber-600">{dept.pending}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">In Progress</p>
                    <p className="text-xl font-bold text-blue-600">{dept.inProgress}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Resolved</p>
                    <p className="text-xl font-bold text-green-600">{dept.resolved}</p>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <Card glass className="p-5 bg-gradient-to-r from-purple-500 to-blue-600">
          <div className="flex items-center gap-3 text-white">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Complaint Heatmap</h3>
              <p className="text-sm text-white/90">View geographic distribution of complaints</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Active Users</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-center py-6">
            <p className="text-4xl font-bold text-gray-900 mb-2">1,247</p>
            <p className="text-sm text-gray-600">Registered Citizens</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <div>
                <p className="text-gray-600">Today</p>
                <p className="font-semibold text-gray-900">+23</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p className="text-gray-600">This Week</p>
                <p className="font-semibold text-gray-900">+156</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
