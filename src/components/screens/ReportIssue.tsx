import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, MapPin, Camera, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, IssueCategory } from '../../lib/supabase';
import * as LucideIcons from 'lucide-react';

interface ReportIssueProps {
  onBack: () => void;
}

type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export function ReportIssue({ onBack }: ReportIssueProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'category' | 'form' | 'success'>('category');
  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [loading, setLoading] = useState(false);
  const [complaintId, setComplaintId] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const { data } = await supabase
      .from('issue_categories')
      .select('*')
      .eq('active', true)
      .order('name');

    if (data) {
      setCategories(data);
    }
  }

  const handleCategorySelect = (category: IssueCategory) => {
    setSelectedCategory(category);
    setTitle(category.name);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('complaints')
      .insert({
        user_id: user.id,
        category_id: selectedCategory.id,
        title,
        description,
        location_address: location,
        severity,
        status: 'submitted',
      })
      .select()
      .single();

    setLoading(false);

    if (!error && data) {
      setComplaintId(data.id);
      setStep('success');
    }
  };

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName.split('-').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')] || LucideIcons.AlertCircle;
    return Icon;
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="px-6 pt-8">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-in zoom-in duration-300">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Issue Reported Successfully!</h1>
            <p className="text-gray-600 mb-2">Complaint ID: #{complaintId.slice(0, 8)}</p>
            <p className="text-gray-600 mb-8">
              Your complaint has been submitted. Our team will review it shortly.
            </p>
            <div className="space-y-3 max-w-md mx-auto">
              <Button fullWidth onClick={() => {
                setStep('category');
                setSelectedCategory(null);
                setTitle('');
                setDescription('');
                setLocation('');
                setSeverity('medium');
              }}>
                Report Another Issue
              </Button>
              <Button fullWidth variant="outline" onClick={onBack}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'form' && selectedCategory) {
    const Icon = getIconComponent(selectedCategory.icon);

    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-6 pt-8 pb-6">
          <button
            onClick={() => setStep('category')}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Change Category
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Icon className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">{selectedCategory.name}</h1>
          </div>
          <p className="text-blue-100">{selectedCategory.description}</p>
        </div>

        <div className="px-6 mt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Issue Details</h3>

              <div className="space-y-4">
                <Input
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief title for the issue"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows={4}
                    placeholder="Describe the issue in detail..."
                    required
                  />
                </div>

                <Input
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter location or address"
                  icon={<MapPin className="w-5 h-5" />}
                  required
                />
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Additional Information</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Severity Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['low', 'medium', 'high', 'critical'] as SeverityLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSeverity(level)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        severity === level
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className={`font-medium ${severity === level ? 'text-blue-600' : 'text-gray-700'}`}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Photo (Optional)
                </label>
                <button
                  type="button"
                  className="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <Camera className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 group-hover:text-blue-600">
                    Click to upload photo
                  </p>
                </button>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('category')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
              >
                Submit Report
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-6 pt-8 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-2xl font-bold mb-2">Report an Issue</h1>
        <p className="text-blue-100">Select the category that best describes your issue</p>
      </div>

      <div className="px-6 mt-6">
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => {
            const Icon = getIconComponent(category.icon);
            return (
              <Card
                key={category.id}
                hover
                onClick={() => handleCategorySelect(category)}
                className="p-4"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg"
                  style={{ backgroundColor: category.color }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {category.name}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
