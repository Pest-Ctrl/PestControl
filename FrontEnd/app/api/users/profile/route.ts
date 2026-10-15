import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { Email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasPassword = Boolean(user.PassHash && user.PassHash.trim() !== '');
    const hasGitHub = Boolean(user.GHOAuth && user.GHOAuth.trim() !== '');

    return NextResponse.json({
      userId: user.UserID || user.UserId || user.id,
      username: user.Username || session.user.name || '',
      email: user.Email || session.user.email,
      role: user.Role || session.user.role || 'Developer',
      hasPassword,
      hasGitHub,
      createdAt: user.CreatedAt || null,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { Email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = user.UserID || user.UserId || user.id;
    const body = await request.json();
    const { action } = body;

    if (action === 'update_username') {
      const { username } = body;
      if (!username || !username.trim()) {
        return NextResponse.json({ error: 'Username cannot be blank' }, { status: 400 });
      }

      await prisma.users.update({
        where: { UserID: userId },
        data: { Username: username.trim() },
      });

      return NextResponse.json({ success: true, message: 'Username updated successfully', username: username.trim() });
    }

    if (action === 'change_password') {
      const { currentPassword, newPassword } = body;
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      }

      // If user already has a password, verify current password
      if (user.PassHash && user.PassHash.trim() !== '') {
        if (!currentPassword) {
          return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.PassHash);
        if (!isMatch) {
          return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.users.update({
        where: { UserID: userId },
        data: { PassHash: hashed },
      });

      return NextResponse.json({ success: true, message: 'Password updated successfully' });
    }

    if (action === 'disconnect_github') {
      await prisma.users.update({
        where: { UserID: userId },
        data: { GHOAuth: null },
      });

      return NextResponse.json({ success: true, message: 'GitHub account disconnected successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
