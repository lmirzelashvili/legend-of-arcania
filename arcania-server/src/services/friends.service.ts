import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';

// ==================== SEND FRIEND REQUEST ====================

export async function sendFriendRequest(userId: string, targetUsername: string) {
  // Find target user by username (case-insensitive)
  const targetUser = await prisma.user.findFirst({
    where: { username: { equals: targetUsername, mode: 'insensitive' } },
  });

  if (!targetUser) {
    throw new AppError(404, 'User not found');
  }

  if (targetUser.id === userId) {
    throw new AppError(400, 'You cannot send a friend request to yourself');
  }

  // Check if already friends
  const existingFriendship = await prisma.friendship.findUnique({
    where: { userId_friendId: { userId, friendId: targetUser.id } },
  });
  if (existingFriendship) {
    throw new AppError(400, 'You are already friends with this user');
  }

  // Check for existing pending request in either direction
  const existingRequest = await prisma.friendRequest.findFirst({
    where: {
      status: 'PENDING',
      OR: [
        { senderId: userId, receiverId: targetUser.id },
        { senderId: targetUser.id, receiverId: userId },
      ],
    },
  });
  if (existingRequest) {
    throw new AppError(400, 'A friend request already exists between you and this user');
  }

  const request = await prisma.friendRequest.create({
    data: {
      senderId: userId,
      receiverId: targetUser.id,
      status: 'PENDING',
    },
    include: {
      receiver: { select: { id: true, username: true } },
    },
  });

  return {
    id: request.id,
    receiverId: request.receiverId,
    receiverUsername: request.receiver.username,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
  };
}

// ==================== ACCEPT FRIEND REQUEST ====================

export async function acceptFriendRequest(userId: string, requestId: string) {
  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError(404, 'Friend request not found');
  }

  if (request.receiverId !== userId) {
    throw new AppError(403, 'You can only accept requests sent to you');
  }

  if (request.status !== 'PENDING') {
    throw new AppError(400, 'This request has already been handled');
  }

  // Create bidirectional friendship + mark request accepted in one transaction
  await prisma.$transaction(async (tx) => {
    await tx.friendRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    });

    await tx.friendship.createMany({
      data: [
        { userId: request.senderId, friendId: request.receiverId },
        { userId: request.receiverId, friendId: request.senderId },
      ],
    });
  });

  return { success: true, message: 'Friend request accepted' };
}

// ==================== REJECT FRIEND REQUEST ====================

export async function rejectFriendRequest(userId: string, requestId: string) {
  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError(404, 'Friend request not found');
  }

  if (request.receiverId !== userId) {
    throw new AppError(403, 'You can only reject requests sent to you');
  }

  if (request.status !== 'PENDING') {
    throw new AppError(400, 'This request has already been handled');
  }

  await prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED' },
  });

  return { success: true, message: 'Friend request rejected' };
}

// ==================== REMOVE FRIEND ====================

export async function removeFriend(userId: string, friendId: string) {
  // Delete both directions in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });
  });

  return { success: true, message: 'Friend removed' };
}

// ==================== GET FRIENDS ====================

export async function getFriends(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: { userId },
    include: {
      friend: {
        select: {
          id: true,
          username: true,
          characters: {
            select: { lastLoginAt: true },
            orderBy: { lastLoginAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  return friendships.map((f) => ({
    id: f.friend.id,
    username: f.friend.username,
    lastLoginAt: f.friend.characters[0]?.lastLoginAt?.toISOString() ?? null,
    since: f.createdAt.toISOString(),
  }));
}

// ==================== GET PENDING REQUESTS ====================

export async function getPendingRequests(userId: string) {
  const [incoming, outgoing] = await Promise.all([
    prisma.friendRequest.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: { sender: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.friendRequest.findMany({
      where: { senderId: userId, status: 'PENDING' },
      include: { receiver: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    incoming: incoming.map((r) => ({
      id: r.id,
      senderId: r.sender.id,
      senderUsername: r.sender.username,
      createdAt: r.createdAt.toISOString(),
    })),
    outgoing: outgoing.map((r) => ({
      id: r.id,
      receiverId: r.receiver.id,
      receiverUsername: r.receiver.username,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}
