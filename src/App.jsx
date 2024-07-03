import React, { useState, useEffect } from "react";
import { ffmpeg } from "ffmpeg";
import { Button } from "./components/Button.jsx";
import { Inputfile } from "./components/Inputfile.jsx";
import { Header } from "./components/Header.jsx";
import { Resultimg } from "./components/Resultimage.jsx";
import { Inputvideo } from "./components/Inputvideo.jsx";
import { Dbutton } from "./components/Dbutton.jsx";

// Create the FFmpeg instance and load it 
const ffmpeg = createFFmpeg({ log: true });

function App() {
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState();
  const [gif, setGif] = useState();

  const load = async () => {
    try {
      await ffmpeg.load();
      setReady(true);
    } catch (error) {
      console.error("Failed to load FFmpeg", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const convertToGif = async () => {
    try {
      // Write the .mp4 to the FFmpeg file system 
      ffmpeg.FS("writeFile", "video1.mp4", await fetchFile(video));

      // Run the FFmpeg command-line tool, converting 
      // the .mp4 into .gif file 
      await ffmpeg.run(
        "-i",
        "video1.mp4",
        "-t",
        "2.5",
        "-ss",
        "2.0",
        "-f",
        "gif",
        "out.gif"
      );

      // Read the .gif file back from the FFmpeg file system 
      const data = ffmpeg.FS("readFile", "out.gif");
      const url = URL.createObjectURL(
        new Blob([data.buffer], { type: "image/gif" })
      );
      setGif(url);
    } catch (error) {
      console.error("Error converting video to GIF", error);
    }
  };

  const download = (e) => {
    console.log(e.target.href);
    fetch(e.target.href, {
      method: "GET",
      headers: {},
    })
      .then((response) => {
        response.arrayBuffer().then(function (buffer) {
          const url = window.URL.createObjectURL(new Blob([buffer]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "image.gif");
          document.body.appendChild(link);
          link.click();
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return ready ? (
    <div className="App">
      <Header />
      {video && <Inputvideo video={video} />}
      <Inputfile setVideo={setVideo} />
      <Button convertToGif={convertToGif} />
      <h1>Result</h1>
      {gif && <Resultimg gif={gif} />}
      {gif && <Dbutton gif={gif} download={download} />}
    </div>
  ) : (
    <p>Loading...</p>
  );
}

export default App;
