import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, X, Settings, Filter, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all', // all, warning, critical, info
    status: 'all', // all, unread, read
    timeframe: '7days' // 24h, 7days, 30days, all
  });
  const [alertSettings, setAlertSettings] = useState({
    warningThreshold: 80, // Alert when 80% of reports used
    criticalThreshold: 95, // Critical alert when 95% of reports used
    enableEmailAlerts: true,
    enablePushNotifications: true
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Mock data - replace with actual API calls
  const mockClinics = [
    {
      id: 'clinic-1',
      name: 'Central Medical Center',
      location: 'Downtown',
      reportsAllowed: 100,
      reportsUsed: 85,
      utilizationRate: 85,
      lastActivity: '2025-09-18T10:30:00Z'
    },
    {
      id: 'clinic-2',
      name: 'Wellness Clinic East',
      location: 'Eastside',
      reportsAllowed: 50,
      reportsUsed: 48,
      utilizationRate: 96,
      lastActivity: '2025-09-18T09:15:00Z'
    },
    {
      id: 'clinic-3',
      name: 'Family Health Partners',
      location: 'Westfield',
      reportsAllowed: 75,
      reportsUsed: 62,
      utilizationRate: 83,
      lastActivity: '2025-09-18T11:45:00Z'
    }
  ];

  // Generate notifications based on clinic usage
  const generateNotifications = (clinics) => {
    const newNotifications = [];
    const now = new Date();

    clinics.forEach(clinic => {
      const utilizationRate = clinic.utilizationRate;

      if (utilizationRate >= alertSettings.criticalThreshold) {
        newNotifications.push({
          id: `critical-${clinic.id}-${now.getTime()}`,
          type: 'critical',
          title: 'Critical: Report Limit Nearly Reached',
          message: `${clinic.name} has used ${clinic.reportsUsed}/${clinic.reportsAllowed} reports (${utilizationRate}%). Immediate attention required.`,
          clinicId: clinic.id,
          clinicName: clinic.name,
          timestamp: now,
          isRead: false,
          action: 'increase_limit'
        });
      } else if (utilizationRate >= alertSettings.warningThreshold) {
        newNotifications.push({
          id: `warning-${clinic.id}-${now.getTime()}`,
          type: 'warning',
          title: 'Warning: High Report Usage',
          message: `${clinic.name} has used ${clinic.reportsUsed}/${clinic.reportsAllowed} reports (${utilizationRate}%). Consider increasing their limit.`,
          clinicId: clinic.id,
          clinicName: clinic.name,
          timestamp: now,
          isRead: false,
          action: 'monitor'
        });
      }

      // Check for rapid consumption patterns
      const hoursUntilLimit = clinic.reportsAllowed - clinic.reportsUsed;
      if (hoursUntilLimit <= 5 && utilizationRate > 70) {
        newNotifications.push({
          id: `rapid-${clinic.id}-${now.getTime()}`,
          type: 'warning',
          title: 'Rapid Report Consumption Detected',
          message: `${clinic.name} may exhaust their report limit within hours. Current usage: ${clinic.reportsUsed}/${clinic.reportsAllowed}.`,
          clinicId: clinic.id,
          clinicName: clinic.name,
          timestamp: now,
          isRead: false,
          action: 'urgent_review'
        });
      }
    });

    return newNotifications;
  };

  // Load and refresh notifications
  useEffect(() => {
    const loadNotifications = () => {
      const newNotifications = generateNotifications(mockClinics);

      // Add some mock historical notifications
      const historicalNotifications = [
        {
          id: 'info-1',
          type: 'info',
          title: 'Monthly Usage Report Available',
          message: 'September usage reports are now available for download.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          isRead: true,
          action: 'download'
        },
        {
          id: 'success-1',
          type: 'success',
          title: 'Clinic Limit Increased',
          message: 'Successfully increased report limit for Central Medical Center to 150 reports.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          isRead: false,
          action: null
        }
      ];

      setNotifications([...newNotifications, ...historicalNotifications]);
    };

    loadNotifications();

    // Refresh notifications every 5 minutes
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [alertSettings]);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filters.type !== 'all' && notification.type !== filters.type) return false;
    if (filters.status !== 'all') {
      if (filters.status === 'unread' && notification.isRead) return false;
      if (filters.status === 'read' && !notification.isRead) return false;
    }

    if (filters.timeframe !== 'all') {
      const now = new Date();
      const notificationTime = new Date(notification.timestamp);
      const timeDiff = now - notificationTime;

      switch (filters.timeframe) {
        case '24h':
          if (timeDiff > 24 * 60 * 60 * 1000) return false;
          break;
        case '7days':
          if (timeDiff > 7 * 24 * 60 * 60 * 1000) return false;
          break;
        case '30days':
          if (timeDiff > 30 * 24 * 60 * 60 * 1000) return false;
          break;
      }
    }

    return true;
  });

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('Notification deleted');
  };

  const handleAction = (notification) => {
    switch (notification.action) {
      case 'increase_limit':
        toast.success(`Redirecting to increase limit for ${notification.clinicName}`);
        break;
      case 'urgent_review':
        toast.success(`Opening urgent review for ${notification.clinicName}`);
        break;
      case 'download':
        toast.success('Starting download...');
        break;
      default:
        markAsRead(notification.id);
    }
  };

  const exportNotifications = () => {
    const csvContent = filteredNotifications.map(notification => ({
      Type: notification.type,
      Title: notification.title,
      Message: notification.message,
      'Clinic Name': notification.clinicName || 'N/A',
      Timestamp: new Date(notification.timestamp).toLocaleString(),
      Status: notification.isRead ? 'Read' : 'Unread'
    }));

    const csvString = [
      Object.keys(csvContent[0]).join(','),
      ...csvContent.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notifications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Notifications exported successfully');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationBorderColor = (type) => {
    switch (type) {
      case 'critical':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'success':
        return 'border-l-green-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-900">Notification Center</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={exportNotifications}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="all">All Types</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>

          <select
            value={filters.timeframe}
            onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="all">All Time</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notifications found matching your filters.</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border-l-4 ${getNotificationBorderColor(notification.type)} p-4 ${
                !notification.isRead ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{new Date(notification.timestamp).toLocaleString()}</span>
                      {notification.clinicName && (
                        <span>Clinic: {notification.clinicName}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {notification.action && (
                    <button
                      onClick={() => handleAction(notification)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      Take Action
                    </button>
                  )}
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Notification Settings</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warning Threshold (%)
                </label>
                <input
                  type="number"
                  value={alertSettings.warningThreshold}
                  onChange={(e) => setAlertSettings(prev => ({ ...prev, warningThreshold: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="1"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Critical Threshold (%)
                </label>
                <input
                  type="number"
                  value={alertSettings.criticalThreshold}
                  onChange={(e) => setAlertSettings(prev => ({ ...prev, criticalThreshold: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="1"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={alertSettings.enableEmailAlerts}
                    onChange={(e) => setAlertSettings(prev => ({ ...prev, enableEmailAlerts: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Enable Email Alerts</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={alertSettings.enablePushNotifications}
                    onChange={(e) => setAlertSettings(prev => ({ ...prev, enablePushNotifications: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Enable Push Notifications</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  toast.success('Settings saved successfully');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;