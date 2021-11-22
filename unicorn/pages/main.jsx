import React from 'react'
import CollaborativeEditor from '../view/collaborative_editor'
import { useRouter } from 'next/router';

const Main = ({ host }) => {
  const router = useRouter();
  const docId = router.query.docId;

  return (
    <div>
      <CollaborativeEditor
        docHost={`wss://${host}`}
        docId={docId}
      />
    </div>
  )
}

export function getServerSideProps({ req, res }) {
  return {
    props: {
      host: req.headers.host
    }
  }
}

export default Main;
