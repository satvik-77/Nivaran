import { useState } from 'react';
import {
  DollarSign, Droplet, Zap, Bus, Trash2, Building2, Phone,
  Calendar, Bell, MapPin, Clock, ArrowRight
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

type ServiceCategory = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  items: string[];
};

const services: ServiceCategory[] = [
  {
    id: 'bills',
    name: 'Pay Utility Bills',
    icon: DollarSign,
    color: 'bg-green-500',
    items: ['Water Bill', 'Electricity Bill', 'Property Tax', 'Waste Collection Fee'],
  },
  {
    id: 'water',
    name: 'Water Supply',
    icon: Droplet,
    color: 'bg-blue-500',
    items: ['Today: 6 AM - 8 AM', 'Evening: 6 PM - 8 PM', 'Status: Normal Supply'],
  },
  {
    id: 'power',
    name: 'Power Updates',
    icon: Zap,
    color: 'bg-yellow-500',
    items: ['No scheduled outages', 'Emergency: Call 1912', 'Status: All areas operational'],
  },
  {
    id: 'transport',
    name: 'Public Transport',
    icon: Bus,
    color: 'bg-purple-500',
    items: ['Bus Routes', 'Metro Schedule', 'Real-time Tracking', 'Pass Renewal'],
  },
  {
    id: 'waste',
    name: 'Waste Collection',
    icon: Trash2,
    color: 'bg-orange-500',
    items: ['Monday & Thursday', 'Next Collection: Tomorrow', 'Recycling: Saturdays'],
  },
  {
    id: 'offices',
    name: 'Govt Offices',
    icon: Building2,
    color: 'bg-indigo-500',
    items: ['Municipal Office', 'Revenue Office', 'Police Station', 'Fire Station'],
  },
  {
    id: 'emergency',
    name: 'Emergency Numbers',
    icon: Phone,
    color: 'bg-red-500',
    items: ['Police: 100', 'Fire: 101', 'Ambulance: 102', 'Disaster: 108'],
  },
  {
    id: 'events',
    name: 'City Events',
    icon: Calendar,
    color: 'bg-teal-500',
    items: ['Community Meet - Jan 25', 'Health Camp - Feb 1', 'Clean Drive - Feb 10'],
  },
];

export function CityServices() {
  const [selectedService, setSelectedService] = useState<ServiceCategory | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleServiceClick = (service: ServiceCategory) => {
    setSelectedService(service);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold mb-2">City Services</h1>
        <p className="text-blue-100">Access all city services in one place</p>
      </div>

      <div className="px-6 mt-6">
        <div className="grid grid-cols-2 gap-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.id}
                hover
                onClick={() => handleServiceClick(service)}
                className="p-5"
              >
                <div className={`${service.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">{service.name}</h3>
              </Card>
            );
          })}
        </div>

        <Card glass className="p-5 mt-6 bg-gradient-to-r from-blue-500 to-teal-500">
          <div className="flex items-start gap-3 text-white">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Latest Announcements</h3>
              <p className="text-sm text-white/90 mb-3">
                Road maintenance work scheduled on MG Road from Jan 20-25. Please plan your routes accordingly.
              </p>
              <button className="text-sm font-medium underline hover:no-underline">
                View All Announcements
              </button>
            </div>
          </div>
        </Card>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="space-y-3">
            <Card hover className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Nearby Offices</h3>
                    <p className="text-sm text-gray-600">Find government offices near you</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>

            <Card hover className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Service Hours</h3>
                    <p className="text-sm text-gray-600">Check office timings</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedService?.name}
        size="md"
      >
        {selectedService && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              {(() => {
                const Icon = selectedService.icon;
                return (
                  <div className={`${selectedService.color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                );
              })()}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedService.name}</h3>
                <p className="text-sm text-gray-600">Service Details</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <ul className="space-y-3">
                {selectedService.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                    <span className="text-gray-700 flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedService.id === 'emergency' && (
              <Card className="p-4 bg-red-50 border border-red-200">
                <p className="text-sm text-red-800 font-medium">
                  For immediate emergencies, please call the appropriate number directly.
                </p>
              </Card>
            )}

            <Button fullWidth variant="outline" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
