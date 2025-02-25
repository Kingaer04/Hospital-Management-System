import Webcam from "react-webcam";
import { useCallback, useRef, useState } from 'react';

export default function CustomWebcam() {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
    }, [webcamRef]);

    const retake = () => {
        setImgSrc(null);
    };

    return (
        <div className="container z-50">
            {imgSrc ? (
                <img src={imgSrc} alt="webcam" />
            ): (
                <Webcam height={600} width={600} ref={webcamRef}/>
            )}
            <div className="">
                {imgSrc ? (
                    <button onClick={retake}>Retake photo</button>
                ) : (
                    <button onClick={capture}>Capture photo</button>
                )}
            </div>
        </div>
    )
}
