import React from "react";
import Webcam from "react-webcam";
function WebcamPhotoCapture({ handleCapture, setIsCameraOn }) {
  const videoConstraints = {
    width: 600,
    height: 400,
    facingMode: "user",
  };
  return (
    <Webcam
      audio={false}
      height={400}
      screenshotFormat="image/jpeg"
      width={600}
      videoConstraints={videoConstraints}
    >
      {({ getScreenshot }) => (
        <div className="flex flex-col gap-3">
          <button
            className="bg-blue-700 text-white p-2 rounded-md"
            onClick={() => handleCapture(getScreenshot)}
          >
            Capture
          </button>
          <button
            className="bg-blue-700 text-white p-2 rounded-md"
            onClick={() => setIsCameraOn(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </Webcam>
  );
}

export default WebcamPhotoCapture;
