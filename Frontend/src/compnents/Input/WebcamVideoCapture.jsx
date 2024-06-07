import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const WebcamVideoCapture = ({ setIsCameraOn, model = "resnet" }) => {
  const [response, setResponse] = useState({});
  const videoConstraints = {
    width: 600,
    height: 400,
    facingMode: "user",
  };
  const webcamRef = useRef(null);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    startCapture();

    return () => {
      stopCapture();
    };
  }, []);

  const startCapture = () => {
    const id = setInterval(() => {
      captureFrame();
    }, 1000);
    setIntervalId(id);
  };

  const stopCapture = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const captureFrame = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      handleUpload(imageSrc);
    }
  };

  const handleUpload = async (imageSrc) => {
    if (!imageSrc) {
      return;
    }

    const base64Data = imageSrc.split(",")[1];
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/data",
        {
          imageData: base64Data,
          filename: "image.jpg",
          model: model,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setResponse({
        class: response.data.class,
        prob: response.data.prob,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div>
      {response?.class && (
        <h1 className="text-left p-2 text-[18px]">
          {response.class} {response.prob}
        </h1>
      )}
      <Webcam
        ref={webcamRef}
        audio={false}
        height={400}
        screenshotFormat="image/jpeg"
        width={600}
        videoConstraints={videoConstraints}
      />
      <div className="flex flex-col gap-3">
        <button
          className="bg-blue-700 text-white p-2 rounded-md"
          onClick={() => setIsCameraOn(false)}
        >
          Stop
        </button>
      </div>
    </div>
  );
};

export default WebcamVideoCapture;
