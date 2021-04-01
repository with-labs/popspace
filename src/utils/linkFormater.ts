export type InviteDetails = {
  otp: string;
  inviteId: string;
};

// helper method used to format publix invites links
export function formatPublicInviteLink(inviteDetails: InviteDetails) {
  return (
    window.location.origin +
    `/invite/${encodeURIComponent(inviteDetails.otp)}?iid=${encodeURIComponent(inviteDetails.inviteId)}`
  );
}
