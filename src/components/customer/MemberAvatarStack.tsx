import type { SessionMemberView } from '@/lib/api/contract';

const MAX_VISIBLE = 4;

function Avatar({ member }: { member: SessionMemberView }) {
  if (member.pictureUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.pictureUrl}
        alt={member.displayName}
        title={member.displayName}
        className="size-7 rounded-full border-2 border-background object-cover"
      />
    );
  }
  return (
    <div
      title={member.displayName}
      className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium"
    >
      {member.displayName.slice(0, 1).toUpperCase()}
    </div>
  );
}

export function MemberAvatarStack({ members }: { members: SessionMemberView[] }) {
  if (members.length === 0) return null;

  const visible = members.slice(0, MAX_VISIBLE);
  const overflow = members.length - visible.length;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((member) => (
        <Avatar key={member.id} member={member} />
      ))}
      {overflow > 0 && (
        <div className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
          +{overflow}
        </div>
      )}
    </div>
  );
}
