import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const Settings = () => {
  const [settings, setSettings] = useState({
    businessName: '',
    email: '',
    phone: '',
    currency: 'USD',
    timeZone: 'UTC',
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get('/settings/branch')
      .then(res => {
        if (res.data) setSettings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load settings', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    axiosClient.post('/settings/branch', settings)
      .then(() => alert('Settings saved successfully'))
      .catch(() => alert('Failed to save settings'));
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-headline-sm text-primary font-serif">Branch Settings</h1>
      
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Business Name</label>
            <input 
              name="businessName"
              value={settings.businessName || ''}
              onChange={handleChange}
              className="w-full bg-surface-variant text-on-surface p-2 rounded-xl focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Email</label>
            <input 
              name="email"
              type="email"
              value={settings.email || ''}
              onChange={handleChange}
              className="w-full bg-surface-variant text-on-surface p-2 rounded-xl focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Phone</label>
            <input 
              name="phone"
              value={settings.phone || ''}
              onChange={handleChange}
              className="w-full bg-surface-variant text-on-surface p-2 rounded-xl focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Currency</label>
            <input 
              name="currency"
              value={settings.currency || 'USD'}
              onChange={handleChange}
              className="w-full bg-surface-variant text-on-surface p-2 rounded-xl focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Time Zone</label>
            <input 
              name="timeZone"
              value={settings.timeZone || 'UTC'}
              onChange={handleChange}
              className="w-full bg-surface-variant text-on-surface p-2 rounded-xl focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="flex items-center mt-6">
            <input 
              type="checkbox"
              name="maintenanceMode"
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
              className="mr-2 h-5 w-5 text-primary rounded"
            />
            <label htmlFor="maintenanceMode" className="text-sm font-medium text-on-surface-variant">Maintenance Mode</label>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </Card>
    </div>
  );
};
