import React from "react";
import ImageUploader from "../compnents/Input/ImageUploader";
function Detection({ model }) {
  return (
    <div className="flex flex-col gap-6">
      <ImageUploader model={model} />
    </div>
  );
}

export default Detection;
