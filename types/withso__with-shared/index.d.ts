declare module '@withso/with-shared' {
  import { Database } from 'massive';
  const shared: {
    db: {
      pg: Database;
    };
  };

  export default shared;
}
