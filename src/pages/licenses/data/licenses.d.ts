declare module './licenses.json' {
  const licenses: Record<
    string,
    {
      licenses: string;
      name: string;
      version: string;
      description: string;
      repository: string;
      copyright: string;
      licenseText: string;
      licenseFile: string;
    }
  >;
  export default licenses;
}
