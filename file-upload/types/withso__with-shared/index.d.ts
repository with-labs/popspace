declare module '@withso/with-shared' {
  import { Database } from 'massive';
  const shared: {
    db: {
      pg: {
        massive: Database;
      };
    };
  };

  export default shared;
}
