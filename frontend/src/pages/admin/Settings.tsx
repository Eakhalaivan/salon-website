import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/use-toast';

export const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    businessName: '',
    email: '',
    phone: '',
    currency: 'USD',
    timeZone: 'UTC',
    maintenanceMode: false,
    brandLogoUrl: '',
    primaryColor: '#8E735C', // Default premium color
    stripePublicKey: '',
    stripeSecretKey: '',
    razorpayKeyId: '',
    razorpayKeySecret: '',
    whatsappApiKey: '',
    whatsappPhoneNumberId: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    axiosClient.get('/settings/branch')
      .then(res => {
        if (res.data) setSettings(prev => ({ ...prev, ...res.data }));
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
    setIsSaving(true);
    axiosClient.post('/settings/branch', settings)
      .then(() => {
        toast({ title: 'Success', description: 'Settings saved successfully', variant: 'success' });
      })
      .catch(() => {
        toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin text-primary material-symbols-outlined text-4xl">progress_activity</div>
    </div>
  );

  const tabs = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'branding', label: 'Branding', icon: 'palette' },
    { id: 'integrations', label: 'Integrations', icon: 'extension' }
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
        <div>
          <h1 className="font-display-lg text-4xl text-on-surface mb-2">Branch Settings</h1>
          <p className="text-on-surface-variant font-body-lg">Manage your branch preferences, branding, and integrations.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="px-6 py-3 rounded-full flex items-center gap-2">
          {isSaving ? (
            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-[20px]">save</span>
          )}
          Save Changes
        </Button>
      </div>
      
      <div className="flex gap-8">
        {/* Sidebar Tabs */}
        <div className="w-64 shrink-0">
          <nav className="flex flex-col gap-2 sticky top-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-label-md transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary text-on-primary shadow-md' 
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <Card className="p-8 rounded-[32px] shadow-sm glass-panel space-y-6 border border-outline-variant/30">
              <h2 className="font-headline-md text-2xl text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">store</span>
                General Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-label-md font-medium text-on-surface-variant mb-2">Business Name</label>
                  <input 
                    name="businessName"
                    value={settings.businessName || ''}
                    onChange={handleChange}
                    placeholder="E.g. LuxeSuite Spa"
                    className="w-full bg-surface-container-lowest text-on-surface p-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-label-md font-medium text-on-surface-variant mb-2">Email Address</label>
                  <input 
                    name="email"
                    type="email"
                    value={settings.email || ''}
                    onChange={handleChange}
                    placeholder="contact@luxesuite.com"
                    className="w-full bg-surface-container-lowest text-on-surface p-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-label-md font-medium text-on-surface-variant mb-2">Phone Number</label>
                  <input 
                    name="phone"
                    value={settings.phone || ''}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-surface-container-lowest text-on-surface p-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-label-md font-medium text-on-surface-variant mb-2">Currency</label>
                  <select
                    name="currency"
                    value={settings.currency || 'USD'}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest text-on-surface p-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-md font-medium text-on-surface-variant mb-2">Time Zone</label>
                  <select
                    name="timeZone"
                    value={settings.timeZone || 'UTC'}
                    onChange={handleChange}
                    className="w-full bg-surface-container-lowest text-on-surface p-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT/BST)</option>
                    <option value="Asia/Kolkata">India Standard Time (IST)</option>
                  </select>
                </div>
              </div>
              <div className="pt-6 border-t border-outline-variant/30 mt-6">
                <div className="flex items-center justify-between bg-surface-container p-4 rounded-2xl border border-outline-variant/20">
                  <div>
                    <p className="font-label-lg font-bold text-on-surface">Maintenance Mode</p>
                    <p className="text-body-sm text-on-surface-variant mt-1">Temporarily disable customer booking access.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      name="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-error"></div>
                  </label>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'branding' && (
            <Card className="p-8 rounded-[32px] shadow-sm glass-panel space-y-6 border border-outline-variant/30">
              <h2 className="font-headline-md text-2xl text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">palette</span>
                Brand Identity
              </h2>
              <div className="space-y-8">
                <div>
                  <label className="block text-label-md font-medium text-on-surface-variant mb-2">Brand Logo URL</label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input 
                        name="brandLogoUrl"
                        value={settings.brandLogoUrl || ''}
                        onChange={handleChange}
                        placeholder="https://example.com/logo.png"
                        className="w-full bg-surface-container-lowest text-on-surface p-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary outline-none transition-all mb-2"
                      />
                      <p className="text-body-sm text-on-surface-variant">Provide a direct URL to your high-resolution logo (PNG/SVG recommended).</p>
                    </div>
                    {settings.brandLogoUrl && (
                      <div className="w-24 h-24 rounded-2xl border border-outline-variant/30 bg-white flex items-center justify-center p-2 shrink-0">
                        <img src={settings.brandLogoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-6 border-t border-outline-variant/30">
                  <label className="block text-label-md font-medium text-on-surface-variant mb-2">Primary Brand Color</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="color"
                      name="primaryColor"
                      value={settings.primaryColor || '#8E735C'}
                      onChange={handleChange}
                      className="w-14 h-14 rounded-full border-none cursor-pointer overflow-hidden p-0 bg-transparent"
                    />
                    <div>
                      <input 
                        name="primaryColor"
                        value={settings.primaryColor || '#8E735C'}
                        onChange={handleChange}
                        className="w-32 bg-surface-container-lowest text-on-surface p-2 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary outline-none transition-all uppercase text-center font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              {/* Payment Gateways */}
              <Card className="p-8 rounded-[32px] shadow-sm glass-panel space-y-6 border border-outline-variant/30">
                <h2 className="font-headline-md text-2xl text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">payments</span>
                  Payment Gateways
                </h2>
                <p className="text-body-sm text-on-surface-variant mb-6">Configure your Stripe or Razorpay credentials to process online payments and deposits.</p>
                
                <div className="space-y-6">
                  <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/20">
                    <h3 className="font-label-lg font-bold text-on-surface mb-4">Stripe API Keys</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Publishable Key</label>
                        <input 
                          name="stripePublicKey"
                          value={settings.stripePublicKey || ''}
                          onChange={handleChange}
                          placeholder="pk_test_..."
                          className="w-full bg-surface-container-lowest text-on-surface p-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Secret Key</label>
                        <input 
                          name="stripeSecretKey"
                          type="password"
                          value={settings.stripeSecretKey || ''}
                          onChange={handleChange}
                          placeholder="sk_test_..."
                          className="w-full bg-surface-container-lowest text-on-surface p-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/20">
                    <h3 className="font-label-lg font-bold text-on-surface mb-4">Razorpay API Keys</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Key ID</label>
                        <input 
                          name="razorpayKeyId"
                          value={settings.razorpayKeyId || ''}
                          onChange={handleChange}
                          placeholder="rzp_test_..."
                          className="w-full bg-surface-container-lowest text-on-surface p-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Key Secret</label>
                        <input 
                          name="razorpayKeySecret"
                          type="password"
                          value={settings.razorpayKeySecret || ''}
                          onChange={handleChange}
                          placeholder="secret..."
                          className="w-full bg-surface-container-lowest text-on-surface p-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Messaging & Marketing */}
              <Card className="p-8 rounded-[32px] shadow-sm glass-panel space-y-6 border border-outline-variant/30">
                <h2 className="font-headline-md text-2xl text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">chat</span>
                  Messaging & Marketing
                </h2>
                <p className="text-body-sm text-on-surface-variant mb-6">Connect WhatsApp Cloud API to send appointment reminders and marketing campaigns.</p>
                
                <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/20">
                  <h3 className="font-label-lg font-bold text-on-surface mb-4">WhatsApp Cloud API</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Phone Number ID</label>
                      <input 
                        name="whatsappPhoneNumberId"
                        value={settings.whatsappPhoneNumberId || ''}
                        onChange={handleChange}
                        placeholder="e.g. 10423..."
                        className="w-full bg-surface-container-lowest text-on-surface p-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-label-sm font-medium text-on-surface-variant mb-1">API Access Token</label>
                      <input 
                        name="whatsappApiKey"
                        type="password"
                        value={settings.whatsappApiKey || ''}
                        onChange={handleChange}
                        placeholder="EAAB..."
                        className="w-full bg-surface-container-lowest text-on-surface p-3 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
