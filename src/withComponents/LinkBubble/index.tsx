import React from 'react'
import './index.css'

import linkImg from './images/link.svg'

type LinkBubbleProps = {
  url: string
}

const LinkBubble = ({url}: LinkBubbleProps) => {

  //TODO finish this up and figure out how to make a link preview
  return (
    <div className='LinkBubble'>
      <div>
          <img className='LinkBubble-img' src={linkImg} alt='link-img'/>
      </div>
      <div>
      </div>
    </div>
  )
}

export default LinkBubble
