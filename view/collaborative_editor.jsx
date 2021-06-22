import dynamic from 'next/dynamic'

const CollaborativeQuill = dynamic(
  () => import('../component/src/collaborative_quill.jsx'),
  { ssr: false }
)

const CollaborativeEditor = (props) => {
  let displayName = `Player ${Math.floor(Math.random() * 10000)}`
  const spinner = <div> Loading... </div>
  return <div>
    <CollaborativeQuill
      spinner={spinner}
      id="editor"
      host={props.docHost}
      docId={props.docId || "-1"}
      docCollection="documents"
      userDisplayName={displayName}
    />
  </div>
}

export default CollaborativeEditor
