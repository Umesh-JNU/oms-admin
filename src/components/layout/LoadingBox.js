import React from 'react';
import Spinner from "react-bootstrap/Spinner"

export default function LoadingBox() {
  return (
    <div className='h-100 d-flex f-center'>
      <Spinner animation="border" role="status" id='loading'>
        <span className='visually-hidden'></span>
      </Spinner>
    </div>
  )
}
