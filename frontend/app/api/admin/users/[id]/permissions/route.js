import { NextResponse } from 'next/server';
import { updateUserPermissions } from '@/services/userService';
import { getAuthUser } from '@/lib/auth';

const VALID_PERMISSIONS = [
  'freelancer:verify',
  'freelancer:earnings',
  'order:read_assigned',
  'order:assign_writer',
  'order:moderate_chat',
  'payment:view_metrics',
  'payment:issue_links',
  'promo:manage',
  'ticket:resolve',
  'system:config',
];

export async function PATCH(req, { params }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { permissions } = await req.json();

    if (!Array.isArray(permissions)) {
      return NextResponse.json({ message: 'permissions must be a string array' }, { status: 400 });
    }

    const invalid = permissions.filter((p) => !VALID_PERMISSIONS.includes(p));
    if (invalid.length > 0) {
      return NextResponse.json({
        message: `Invalid permission(s): ${invalid.join(', ')}`,
        validPermissions: VALID_PERMISSIONS,
      }, { status: 400 });
    }

    const updated = await updateUserPermissions(id, permissions);
    return NextResponse.json({ id: updated.id, email: updated.email, permissions: updated.permissions });
  } catch (error) {
    console.error('Failed to update permissions:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
