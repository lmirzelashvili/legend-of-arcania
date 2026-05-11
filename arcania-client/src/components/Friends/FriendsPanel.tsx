import React, { useState, useEffect, useCallback } from 'react';
import {
  friendsAPI,
  Friend,
  FriendRequestIncoming,
  FriendRequestOutgoing,
  PendingRequests,
} from '@/services/api.service';
import PixelPanel from '@/components/ui/PixelPanel';
import PixelButton from '@/components/ui/PixelButton';

const FriendsPanel: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequests>({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [friendsData, pendingData] = await Promise.all([
        friendsAPI.getFriends(),
        friendsAPI.getPendingRequests(),
      ]);
      setFriends(friendsData);
      setPending(pendingData);
    } catch (error) {
      console.error('Failed to load friends data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSendRequest = async () => {
    const trimmed = username.trim();
    if (!trimmed) return;

    setActionLoading('send');
    try {
      await friendsAPI.sendRequest(trimmed);
      showMessage(`Friend request sent to ${trimmed}`, 'success');
      setUsername('');
      await loadData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to send request';
      showMessage(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (req: FriendRequestIncoming) => {
    setActionLoading(req.id);
    try {
      await friendsAPI.acceptRequest(req.id);
      showMessage(`You are now friends with ${req.senderUsername}`, 'success');
      await loadData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to accept request';
      showMessage(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (req: FriendRequestIncoming) => {
    setActionLoading(req.id);
    try {
      await friendsAPI.rejectRequest(req.id);
      showMessage(`Rejected request from ${req.senderUsername}`, 'success');
      await loadData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to reject request';
      showMessage(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOutgoing = async (req: FriendRequestOutgoing) => {
    setActionLoading(req.id);
    try {
      await friendsAPI.rejectRequest(req.id);
      showMessage(`Cancelled request to ${req.receiverUsername}`, 'success');
      await loadData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to cancel request';
      showMessage(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFriend = async (friend: Friend) => {
    setActionLoading(friend.id);
    try {
      await friendsAPI.removeFriend(friend.id);
      showMessage(`Removed ${friend.username} from friends`, 'success');
      await loadData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to remove friend';
      showMessage(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatTimeSince = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="font-pixel text-center text-gray-500 py-20 text-[10px]">
        Loading friends...
      </div>
    );
  }

  return (
    <div className="font-pixel">
      {/* Header */}
      <div className="text-center mb-6">
        <div
          className="text-amber-400 text-[14px] mb-1"
          style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}
        >
          FRIENDS
        </div>
        <div className="text-gray-600 text-[7px]">
          Connect with other adventurers across Arcania
        </div>
      </div>

      {/* Add Friend */}
      <PixelPanel title="ADD FRIEND" color="amber">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendRequest();
            }}
            className="flex-1 bg-black border-2 border-gray-800 px-3 py-2 text-gray-300 text-[8px] focus:outline-none focus:border-amber-600 font-pixel"
          />
          <PixelButton
            onClick={handleSendRequest}
            variant={username.trim() && actionLoading !== 'send' ? 'primary' : 'disabled'}
            size="sm"
          >
            {actionLoading === 'send' ? 'SENDING...' : 'SEND REQUEST'}
          </PixelButton>
        </div>
      </PixelPanel>

      {/* Status Message */}
      {message && (
        <div
          className={`mt-4 border-2 p-3 text-center text-[8px] ${
            message.type === 'success'
              ? 'border-green-700 bg-green-900/20 text-green-400'
              : 'border-red-700 bg-red-900/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Left: Friends List */}
        <PixelPanel title={`FRIENDS (${friends.length})`} color="green">
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {friends.length === 0 ? (
              <div className="text-gray-700 text-[8px] text-center py-8">
                No friends yet. Send a request to get started!
              </div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3 border-2 border-gray-800 bg-black hover:border-gray-700 transition-colors"
                >
                  <div>
                    <div className="text-gray-300 text-[9px]">{friend.username}</div>
                    <div className="text-gray-600 text-[7px] mt-1">
                      Last login: {formatTimeSince(friend.lastLoginAt)}
                    </div>
                  </div>
                  <PixelButton
                    onClick={() => handleRemoveFriend(friend)}
                    variant={actionLoading === friend.id ? 'disabled' : 'danger'}
                    size="sm"
                  >
                    {actionLoading === friend.id ? '...' : 'REMOVE'}
                  </PixelButton>
                </div>
              ))
            )}
          </div>
        </PixelPanel>

        {/* Right: Pending Requests */}
        <PixelPanel
          title={`PENDING REQUESTS (${pending.incoming.length + pending.outgoing.length})`}
          color="purple"
        >
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {/* Incoming */}
            {pending.incoming.length > 0 && (
              <div>
                <div className="text-gray-500 text-[7px] mb-2 tracking-widest">INCOMING</div>
                <div className="space-y-2">
                  {pending.incoming.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-3 border-2 border-purple-900 bg-purple-900/10"
                    >
                      <div>
                        <div className="text-gray-300 text-[9px]">{req.senderUsername}</div>
                        <div className="text-gray-600 text-[7px] mt-1">
                          {formatTimeSince(req.createdAt)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <PixelButton
                          onClick={() => handleAccept(req)}
                          variant={actionLoading === req.id ? 'disabled' : 'success'}
                          size="sm"
                        >
                          {actionLoading === req.id ? '...' : 'ACCEPT'}
                        </PixelButton>
                        <PixelButton
                          onClick={() => handleReject(req)}
                          variant={actionLoading === req.id ? 'disabled' : 'danger'}
                          size="sm"
                        >
                          REJECT
                        </PixelButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outgoing */}
            {pending.outgoing.length > 0 && (
              <div>
                <div className="text-gray-500 text-[7px] mb-2 tracking-widest">OUTGOING</div>
                <div className="space-y-2">
                  {pending.outgoing.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-3 border-2 border-gray-800 bg-black"
                    >
                      <div>
                        <div className="text-gray-300 text-[9px]">{req.receiverUsername}</div>
                        <div className="text-gray-600 text-[7px] mt-1">
                          Sent {formatTimeSince(req.createdAt)}
                        </div>
                      </div>
                      <PixelButton
                        onClick={() => handleCancelOutgoing(req)}
                        variant={actionLoading === req.id ? 'disabled' : 'secondary'}
                        size="sm"
                      >
                        {actionLoading === req.id ? '...' : 'CANCEL'}
                      </PixelButton>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {pending.incoming.length === 0 && pending.outgoing.length === 0 && (
              <div className="text-gray-700 text-[8px] text-center py-8">
                No pending requests
              </div>
            )}
          </div>
        </PixelPanel>
      </div>
    </div>
  );
};

export default FriendsPanel;
