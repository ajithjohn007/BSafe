// ImagePreview.js
import React from 'react';
import { useLocation } from 'react-router-dom';

const ImagePreview = () => {
  const location = useLocation();
  const { imageUrl } = location.state;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <img src={imageUrl} alt="Evidence" className="max-w-full max-h-screen" />
    </div>
  );
};

export default ImagePreview;
