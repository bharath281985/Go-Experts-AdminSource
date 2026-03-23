import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Save, Mail, Send, CheckCircle, AlertCircle, TestTube, Loader2, X } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import api from '../lib/api';
import { toast } from 'sonner';

interface EmailSettingsProps {
  onNavigate: (page: string) => void;
}

export function EmailSettings({ onNavigate }: EmailSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const [templates, setTemplates] = useState<any[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editForm, setEditForm] = useState({ subject: '', body: '', status: 'active' });

  const [settings, setSettings] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_pass: '',
    email_from: '',
    email_from_name: '',
    email_reply_to: '',
    email_encryption: 'SSL',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [{ data: settingsData }, { data: templatesData }] = await Promise.all([
        api.get('/cms/settings/admin'),
        api.get('/cms/email-templates/admin')
      ]);

      if (settingsData.success && settingsData.settings) {
        setSettings({
          smtp_host: settingsData.settings.smtp_host || '',
          smtp_port: settingsData.settings.smtp_port || '',
          smtp_user: settingsData.settings.smtp_user || '',
          smtp_pass: settingsData.settings.smtp_pass || '',
          email_from: settingsData.settings.email_from || '',
          email_from_name: settingsData.settings.email_from_name || '',
          email_reply_to: settingsData.settings.email_reply_to || '',
          email_encryption: settingsData.settings.email_encryption || 'SSL',
        });
      }

      if (templatesData.success && templatesData.templates) {
        setTemplates(templatesData.templates);
      }
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setEditForm({
      subject: template.subject,
      body: template.body,
      status: template.status || 'active'
    });
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/cms/email-templates/${editingTemplate._id}`, editForm);
      if (data.success) {
        toast.success('Template updated successfully!');
        setTemplates(templates.map(t => t._id === editingTemplate._id ? data.template : t));
        setEditingTemplate(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update template');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/cms/settings', settings);
      toast.success('Email settings saved successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }
    setTesting(true);
    try {
      await api.post('/admin/test-email', { email: testEmail });
      setTestEmailSent(true);
      toast.success('Test email sent successfully!');
      setTimeout(() => setTestEmailSent(false), 5000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'SMTP Test Failed');
    } finally {
      setTesting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading email settings...</p>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb
        items={[{ label: 'Site Management', path: 'pages' }, { label: 'Email Settings' }]}
        onNavigate={onNavigate}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#044071] dark:text-white mb-2">Email Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure SMTP settings and email templates</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SMTP Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(242, 76, 32, 0.1)' }}>
              <Mail className="w-6 h-6 text-[#F24C20]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#044071] dark:text-white">SMTP Configuration</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mail server settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">SMTP Host</label>
                <input
                  type="text"
                  value={settings.smtp_host}
                  onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">SMTP Port</label>
                <input
                  type="text"
                  value={settings.smtp_port}
                  onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">SMTP Username</label>
              <input
                type="text"
                value={settings.smtp_user}
                onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">SMTP Password</label>
              <input
                type="password"
                value={settings.smtp_pass}
                onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">From Email</label>
                <input
                  type="email"
                  value={settings.email_from}
                  onChange={(e) => setSettings({ ...settings, email_from: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">From Name</label>
                <input
                  type="text"
                  value={settings.email_from_name}
                  onChange={(e) => setSettings({ ...settings, email_from_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Reply-To Email</label>
                <input
                  type="email"
                  value={settings.email_reply_to}
                  onChange={(e) => setSettings({ ...settings, email_reply_to: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Encryption</label>
                <select
                  value={settings.email_encryption}
                  onChange={(e) => setSettings({ ...settings, email_encryption: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                >
                  <option>TLS</option>
                  <option>SSL</option>
                  <option>None</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Test Email */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(4, 64, 113, 0.1)' }}>
              <TestTube className="w-6 h-6 text-[#044071]" />
            </div>
            <h2 className="text-lg font-bold text-[#044071] dark:text-white">Test Email</h2>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Send a test email to verify SMTP configuration
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Test Email Address</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
            />
          </div>

          <button
            onClick={handleTestEmail}
            className="w-full bg-[#044071] hover:bg-[#033559] text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send Test Email
          </button>

          {testEmailSent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 flex items-start gap-2"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Test email sent!</p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">Check {testEmail} inbox</p>
              </div>
            </motion.div>
          )}

          <div className="mt-6 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Important</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Make sure to save settings before sending test email
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Email Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#044071] dark:text-white">Email Templates</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage automated email templates</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#262626]">
                <th className="text-left py-4 px-4 font-semibold text-sm">Template Name</th>
                <th className="text-left py-4 px-4 font-semibold text-sm">Subject Line</th>
                <th className="text-left py-4 px-4 font-semibold text-sm">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-sm">Last Edited</th>
                <th className="text-right py-4 px-4 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template, index) => (
                <motion.tr
                  key={template._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="border-b border-gray-100 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(242, 76, 32, 0.1)' }}>
                        <Mail className="w-4 h-4 text-[#F24C20]" />
                      </div>
                      <span className="font-medium">{template.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{template.subject}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${template.status === 'active' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                      {template.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(template.updatedAt)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="px-4 py-2 rounded-lg border border-[#044071] text-[#044071] dark:text-white hover:bg-[#044071] hover:text-white transition-colors text-sm font-medium">
                        Edit Template
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Edit Template Modal */}
      <AnimatePresence>
        {editingTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#262626] p-6 flex justify-between items-center z-10">
                <h3 className="text-xl font-bold text-[#044071] dark:text-white">Edit {editingTemplate.name}</h3>
                <button onClick={() => setEditingTemplate(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject Line</label>
                  <input
                    type="text"
                    value={editForm.subject}
                    onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Body (HTML supported)</label>
                  <p className="text-xs text-gray-500 mb-2">Available variables: {`{name}`}, {`{link}`}</p>
                  <textarea
                    rows={8}
                    value={editForm.body}
                    onChange={(e) => setEditForm(prev => ({ ...prev, body: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20] font-mono text-sm"
                  />
                </div>
              </div>
              <div className="sticky bottom-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-[#262626] p-6 flex justify-end gap-3 z-10">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] font-medium hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTemplate}
                  disabled={saving}
                  className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {saving ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
