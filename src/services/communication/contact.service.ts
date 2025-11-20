import axiosClient from '../../api/axios.client';
import {
  IncomingEmail,
  VerzondEmail,
  Notification,
  WFCOrder,
} from '../../api/types/communication.types';

export class ContactService {
  async getIncomingEmails(): Promise<IncomingEmail[]> {
    const response = await axiosClient.get('/incoming-emails');
    return response.data;
  }

  async getIncomingEmailById(id: string): Promise<IncomingEmail> {
    const response = await axiosClient.get(`/incoming-emails/${id}`);
    return response.data;
  }

  async markEmailAsRead(id: string): Promise<void> {
    await axiosClient.put(`/incoming-emails/${id}/read`);
  }

  async getSentEmails(): Promise<VerzondEmail[]> {
    const response = await axiosClient.get('/sent-emails');
    return response.data;
  }

  async sendEmail(email: Partial<VerzondEmail>): Promise<VerzondEmail> {
    const response = await axiosClient.post('/send-email', email);
    return response.data;
  }

  async getNotifications(): Promise<Notification[]> {
    const response = await axiosClient.get('/notifications');
    return response.data;
  }

  async createNotification(notification: Partial<Notification>): Promise<Notification> {
    const response = await axiosClient.post('/notifications', notification);
    return response.data;
  }

  async updateNotification(id: string, notification: Partial<Notification>): Promise<Notification> {
    const response = await axiosClient.put(`/notifications/${id}`, notification);
    return response.data;
  }

  async deleteNotification(id: string): Promise<void> {
    await axiosClient.delete(`/notifications/${id}`);
  }

  async getWFCOrders(): Promise<WFCOrder[]> {
    const response = await axiosClient.get('/wfc-orders');
    return response.data;
  }

  async getWFCOrderById(id: string): Promise<WFCOrder> {
    const response = await axiosClient.get(`/wfc-orders/${id}`);
    return response.data;
  }

  async createWFCOrder(order: Partial<WFCOrder>): Promise<WFCOrder> {
    const response = await axiosClient.post('/wfc-orders', order);
    return response.data;
  }

  async updateWFCOrder(id: string, order: Partial<WFCOrder>): Promise<WFCOrder> {
    const response = await axiosClient.put(`/wfc-orders/${id}`, order);
    return response.data;
  }

  async deleteWFCOrder(id: string): Promise<void> {
    await axiosClient.delete(`/wfc-orders/${id}`);
  }
}