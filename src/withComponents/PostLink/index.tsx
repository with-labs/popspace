import React, { useState } from 'react'
import clsx from 'clsx'
import './index.css'

import linkImg from './images/link.svg'
import FormInput from '../FormInput'

type PostLinkProps = {
  onSubmitHandler: Function;
};

const PostLink = (props: PostLinkProps) => {
  const [linkUrl, setLinkUrl] = useState('')

  const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (props.onSubmitHandler) {
      props.onSubmitHandler(linkUrl)
    }
  }

  return (
    <div className={ clsx('PostLink') }>
      <div>
        <img className='PostLink-img' src={linkImg} alt='link_icon' />
      </div>
      <div className='PostLink-text'>
        Add a link
      </div>
      <div className='PostLink-form'>
        <form onSubmit={onSubmitHandler}>
          <FormInput
            placeholderText={'Url'}
            value={linkUrl}
            setValue={setLinkUrl}
          />
          <button
            type="submit"
            className={clsx('PostLink-button', { 'is-inactive': linkUrl.length === 0 })}
          >
            Post Link
          </button>
        </form>
      </div>
    </div>
  )
}

export default PostLink
