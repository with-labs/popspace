export type InviteDetails = {
  otp: string;
  inviteId: string;
};

// helper method used to format public invites links
export function formatPublicInviteLink(inviteDetails: InviteDetails) {
  return (
    window.location.origin +
    `/join/${encodeURIComponent(inviteDetails.otp)}?iid=${encodeURIComponent(inviteDetails.inviteId)}`
  );
}
