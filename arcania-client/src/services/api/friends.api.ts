import { api } from './client';

export interface Friend {
  id: string;
  username: string;
  lastLoginAt: string | null;
  since: string;
}

export interface FriendRequestIncoming {
  id: string;
  senderId: string;
  senderUsername: string;
  createdAt: string;
}

export interface FriendRequestOutgoing {
  id: string;
  receiverId: string;
  receiverUsername: string;
  createdAt: string;
}

export interface PendingRequests {
  incoming: FriendRequestIncoming[];
  outgoing: FriendRequestOutgoing[];
}

export const friendsAPI = {
  getFriends: (): Promise<Friend[]> =>
    api.get('/friends').then(r => r.data),

  getPendingRequests: (): Promise<PendingRequests> =>
    api.get('/friends/requests').then(r => r.data),

  sendRequest: (username: string): Promise<{ id: string; receiverId: string; receiverUsername: string; status: string; createdAt: string }> =>
    api.post('/friends/request', { username }).then(r => r.data),

  acceptRequest: (requestId: string): Promise<{ success: boolean; message: string }> =>
    api.post(`/friends/accept/${requestId}`).then(r => r.data),

  rejectRequest: (requestId: string): Promise<{ success: boolean; message: string }> =>
    api.post(`/friends/reject/${requestId}`).then(r => r.data),

  removeFriend: (friendId: string): Promise<{ success: boolean; message: string }> =>
    api.delete(`/friends/${friendId}`).then(r => r.data),
};
