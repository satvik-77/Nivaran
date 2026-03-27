import { useState, useEffect } from 'react';
import { Clock, MapPin, MessageCircle, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Complaint, IssueCategory } from '../../lib/supabase';

export function TrackComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<(Complaint & { category: IssueCategory })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<(Complaint & { category: IssueCategory }) | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user) {
      loadComplaints();
    }
  }, [user]);

  async function loadComplaints() {
    if (!user) return;

    const { data } = await supabase
      .from('complaints')
      .select(`
        *,
        category:issue_categories(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setComplaints(data as any);
    }
    setLoading(false);
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'default', label: string }> = {
      submitted: { variant: 'info', label: 'Submitted' },
      under_review: { variant: 'warning', label: 'Under Review' },
      assigned: { variant: 'info', label: 'Assigned' },
      in_progress: { variant: 'warning', label: 'In Progress' },
      resolved: { variant: 'success', label: 'Resolved' },
      rejected: { variant: 'error', label: 'Rejected' },
    };

    const config = variants[status] || { variant: 'default' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTimelineSteps = (complaint: Complaint) => {
    const allSteps = [
      { status: 'submitted', label: 'Submitted', completed: true },
      { status: 'under_review', label: 'Under Review', completed: false },
      { status: 'assigned', label: 'Assigned', completed: false },
      { status: 'in_progress', label: 'In Progress', completed: false },
      { status: 'resolved', label: 'Resolved', completed: false },
    ];

    const statusOrder = ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected'];
    const currentIndex = statusOrder.indexOf(complaint.status);

    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex && complaint.status !== 'rejected',
      active: step.status === complaint.status,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-6 pt-12 pb-6">
          <h1 className="text-2xl font-bold mb-2">Track Complaints</h1>
          <p className="text-blue-100">Monitor the status of your reported issues</p>
        </div>
        <div className="px-6 mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold mb-2">Track Complaints</h1>
        <p className="text-blue-100">Monitor the status of your reported issues</p>
      </div>

      <div className="px-6 mt-6">
        {complaints.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <FileText className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Complaints Yet</h3>
            <p className="text-gray-600 mb-4">You haven't reported any issues yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {complaints.map((complaint) => (
              <Card
                key={complaint.id}
                hover
                onClick={() => {
                  setSelectedComplaint(complaint);
                  setShowDetails(true);
                }}
                className="p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(complaint.status)}
                    <h3 className="font-semibold text-gray-900">{complaint.title}</h3>
                  </div>
                  {getStatusBadge(complaint.status)}
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{complaint.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    {complaint.location_address && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-[150px]">{complaint.location_address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(complaint.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Complaint Details"
        size="lg"
      >
        {selectedComplaint && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{selectedComplaint.title}</h3>
                {getStatusBadge(selectedComplaint.status)}
              </div>
              <p className="text-gray-600 mb-4">{selectedComplaint.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Complaint ID</p>
                  <p className="font-medium">#{selectedComplaint.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Category</p>
                  <p className="font-medium">{selectedComplaint.category.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Severity</p>
                  <p className="font-medium capitalize">{selectedComplaint.severity}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Reported On</p>
                  <p className="font-medium">{formatDate(selectedComplaint.created_at)}</p>
                </div>
              </div>

              {selectedComplaint.location_address && (
                <div className="mt-4">
                  <p className="text-gray-500 mb-1 text-sm">Location</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <MapPin className="w-4 h-4" />
                    <p>{selectedComplaint.location_address}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Progress Timeline</h4>
              <div className="space-y-4">
                {getTimelineSteps(selectedComplaint).map((step, index) => (
                  <div key={step.status} className="flex items-start gap-3">
                    <div className="relative">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          step.completed
                            ? 'bg-blue-600 border-blue-600'
                            : step.active
                            ? 'bg-white border-blue-600'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {step.completed && (
                          <CheckCircle className="w-5 h-5 text-white" />
                        )}
                        {step.active && !step.completed && (
                          <div className="w-3 h-3 bg-blue-600 rounded-full" />
                        )}
                      </div>
                      {index < 4 && (
                        <div
                          className={`absolute left-1/2 -translate-x-1/2 top-8 w-0.5 h-6 ${
                            step.completed ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p
                        className={`font-medium ${
                          step.completed || step.active ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedComplaint.assigned_officer && (
              <Card className="p-4 bg-blue-50 border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-2">Assigned Officer</h4>
                <p className="text-gray-700">{selectedComplaint.assigned_officer}</p>
              </Card>
            )}

            <Button
              fullWidth
              variant="outline"
              onClick={() => {}}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat with Support
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
