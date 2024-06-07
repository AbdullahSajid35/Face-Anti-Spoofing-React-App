import React from "react";
import ImageUploading from "react-images-uploading";
import axios from "axios";
import { useEffect, useState } from "react";
import WebcamPhotoCapture from "./WebcamPhotoCapture";
import WebcamVideoCapture from "./WebcamVideoCapture";
function ImageUploader({ model = "resnet" }) {
  const [images, setImages] = useState([]);
  const [isImg, setIsImg] = useState(false);
  const [predictedClass, setPredictedClass] = useState(undefined);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isLiveOn, setIsLiveOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCapture = (getScreenshot) => {
    const image = getScreenshot();
    setImages([{ data_url: image }]);
    setIsCameraOn(false);
  };

  const onChange = (imageList) => {
    setImages([imageList[0]]);
  };

  const handleUpload = async (image) => {
    if (!image || !image.data_url) {
      return;
    }

    const base64Data = image.data_url.split(",")[1];
    setLoading(true);
    setError(null);

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
      setPredictedClass({
        class: response.data.class,
        prob: response.data.prob,
      });
      console.log(
        "Predicted class is:",
        response.data.class,
        " Probability is:",
        response.data.prob
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Error uploading image. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (images.length > 0) {
      handleUpload(images[0]);
      setIsImg(true);
    } else {
      setIsImg(false);
      setPredictedClass(undefined);
    }
  }, [images]);
  return (
    <ImageUploading value={images} onChange={onChange} dataURLKey="data_url">
      {({
        imageList,
        onImageUpload,
        onImageUpdate,
        onImageRemove,
        isDragging,
        dragProps,
      }) => (
        <div className="upload__image-wrapper flex flex-col gap-6 w-full items-center">
          <div className="flex gap-8">
            <button
              className={`bg-blue-700 text-white p-2 rounded-md ${
                isImg || isCameraOn || isLiveOn ? "hidden" : "flex"
              }`}
              style={isDragging ? { color: "red" } : undefined}
              onClick={onImageUpload}
              {...dragProps}
            >
              Upload Photo
            </button>
            <button
              className={`bg-blue-700 text-white p-2 rounded-md ${
                isImg && !isCameraOn && !isLiveOn ? "flex" : "hidden"
              }`}
              onClick={() => onImageUpdate(0)}
              disabled={!isImg}
            >
              Update
            </button>
            <button
              className={`bg-blue-700 text-white p-2 rounded-md ${
                isImg && !isCameraOn && !isLiveOn ? "flex" : "hidden"
              }`}
              onClick={() => {
                setPredictedClass(undefined);
                setImages([]);
              }}
              disabled={!isImg}
            >
              Remove
            </button>
            <button
              className={`bg-blue-700 text-white p-2 rounded-md ${
                isCameraOn || isLiveOn ? "hidden" : "flex"
              }`}
              onClick={() => setIsCameraOn(true)}
            >
              Capture Photo
            </button>
            <button
              className={`bg-blue-700 text-white p-2 rounded-md ${
                isLiveOn || isCameraOn ? "hidden" : "flex"
              }`}
              onClick={() => setIsLiveOn(true)}
            >
              Live Detection
            </button>
          </div>
          {loading && <div>Loading...</div>}
          {error && <div>{error}</div>}
          {predictedClass && !isCameraOn && !isLiveOn && (
            <div className="flex justify-center mb-[-15px]">
              <h1>
                Image is {predictedClass.class} {predictedClass.prob}%
              </h1>
            </div>
          )}
          {isCameraOn && (
            <div className="flex  items-center gap-12">
              <WebcamPhotoCapture
                handleCapture={handleCapture}
                setIsCameraOn={setIsCameraOn}
              />
            </div>
          )}

          {!isCameraOn &&
            !isLiveOn &&
            images.map((image, index) => (
              <div
                key={index}
                className="image-item flex flex-col items-center w-full"
              >
                <img src={image.data_url} alt="" className="w-[40%]" />
              </div>
            ))}

          {isLiveOn && (
            <WebcamVideoCapture setIsCameraOn={setIsLiveOn} model={model} />
          )}
        </div>
      )}
    </ImageUploading>
  );
}

export default ImageUploader;
