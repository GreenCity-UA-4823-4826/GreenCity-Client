import axios from 'axios';
import { BehaviorSubject } from 'rxjs';
import AuthService from '../auth/AuthService';
import { MVP_API_URL } from '../../config/api';

// Base API URL from central configuration
const API_BASE_URL = MVP_API_URL;
const NOTIFICATIONS_LINK = `${API_BASE_URL}/notifications`;

/**
 * Service for notifications-related API calls
 */
class NotificationsService {
  /**
   * Subject for notifications count
   * @type {BehaviorSubject<number>}
   */
  static notificationsCount$ = new BehaviorSubject(0);

  /**
   * Subject for notifications
   * @type {BehaviorSubject<Array<Object>>}
   */
  static notifications$ = new BehaviorSubject([]);

  /**
   * Get all notifications for the current user
   *
   * @param {number} page - Page number (0-based)
   * @param {number} size - Page size
   * @returns {Promise<Object>} Promise that resolves to notifications data
   */
  static async getNotifications(page = 0, size = 10) {
    try {
      // Check if user is authenticated
      if (!AuthService.isAuthenticated()) {
        throw new Error('User must be authenticated to get notifications');
      }

      const response = await axios.get(`${NOTIFICATIONS_LINK}`, {
        params: { page, size }
      });

      this.notifications$.next(response.data.page || []);
      return response.data;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  /**
   * Get the count of unread notifications
   *
   * @returns {Promise<number>} Promise that resolves to the count of unread notifications
   */
  static async getUnreadNotificationsCount() {
    try {
      // Check if user is authenticated
      if (!AuthService.isAuthenticated()) {
        return 0;
      }

      const response = await axios.get(NOTIFICATIONS_LINK, {
        params: {
          page: 0,
          size: 1,
          viewed: false
        }
      });
      const count = response.data.totalElements || 0;
      this.notificationsCount$.next(count);
      return count;
    } catch (error) {
      console.error('Error getting unread notifications count:', error);
      return 0;
    }
  }

  /**
   * Mark a notification as read
   *
   * @param {number} id - Notification ID
   * @returns {Promise<Object>} Promise that resolves when notification is marked as read
   */
  static async markAsRead(id) {
    try {
      // Check if user is authenticated
      if (!AuthService.isAuthenticated()) {
        throw new Error('User must be authenticated to mark notifications as read');
      }

      const response = await axios.post(`${NOTIFICATIONS_LINK}/${id}/viewNotification`);

      // Update the count of unread notifications
      this.getUnreadNotificationsCount();

      return response.data;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   *
   * @returns {Promise<Object>} Promise that resolves when all notifications are marked as read
   */
  static async markAllAsRead() {
    try {
      // Check if user is authenticated
      if (!AuthService.isAuthenticated()) {
        throw new Error('User must be authenticated to mark all notifications as read');
      }

      const unreadNotifications = await axios.get(NOTIFICATIONS_LINK, {
        params: {
          page: 0,
          size: 100,
          viewed: false
        }
      });
      await Promise.all(
        (unreadNotifications.data.page || []).map((notification) =>
          axios.post(`${NOTIFICATIONS_LINK}/${notification.notificationId}/viewNotification`)
        )
      );

      // Update the count of unread notifications
      this.notificationsCount$.next(0);

      return undefined;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}

export default NotificationsService;
