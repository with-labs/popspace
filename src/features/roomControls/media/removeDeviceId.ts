export function removeDeviceId(deviceLabel: string) {
  return deviceLabel.replace(/\([a-zA-Z0-9]{4}:[a-zA-Z0-9]{4}\)$/, '');
}
