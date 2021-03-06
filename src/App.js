import React, { Component } from "react";
import ReactDOM from "react-dom";
import MagicDropzone from "react-magic-dropzone";
import Axios from 'axios';
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

import './App.css';


class App extends Component {
  state = {
    model: null,
    preview: "",
    predictions: [],
    err: false

  };

  componentWillMount() {
    cocoSsd.load().then(model => {
      this.setState({
        model: model
      });
    });

  }

  onDrop = (accepted, rejected, links) => {
    if (accepted) {
      this.setState({ preview: accepted[0].preview || links[0] });
      this.state.err = true;

    }
    if (rejected == true) {
      alert("Input format not supported");
    }
  };

  cropToCanvas = (image, canvas, ctx) => {
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (naturalWidth > naturalHeight) {
      ctx.drawImage(
        image,
        (naturalWidth - naturalHeight) / 2,
        0,
        naturalHeight,
        naturalHeight,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
    } else {
      ctx.drawImage(
        image,
        0,
        (naturalHeight - naturalWidth) / 2,
        naturalWidth,
        naturalWidth,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
    }
  };

  onImageChange = e => {
    const c = document.getElementById("canvas");
    const ctx = c.getContext("2d");
    this.cropToCanvas(e.target, c, ctx);
    this.state.model.detect(c).then(predictions => {

      const font = "16px sans-serif";
      ctx.font = font;
      ctx.textBaseline = "top";

      predictions.forEach(prediction => {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        const width = prediction.bbox[2];
        const height = prediction.bbox[3];

        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = "#00FFFF";
        const textWidth = ctx.measureText(prediction.class).width;
        const textHeight = parseInt(font, 10);
        ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
      });

      predictions.forEach(prediction => {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        // Draw the text last to ensure it's on top.
        ctx.fillStyle = "#000000";
        ctx.fillText(prediction.class, x, y);

      });
    });
  };

  render() {
    return (
      <div className="App">
        <div className="Dropzone-page">

          <h1>Extraction of information from an image</h1>
          {this.state.model ? (
            <MagicDropzone
              className="Dropzone"
              accept="image/jpeg, image/png, .jpg, .jpeg, .png"
              multiple={false}
              onDrop={this.onDrop}
            >

              {this.state.err ? (
                <img
                  alt="upload preview"
                  onLoad={this.onImageChange}
                  className="Dropzone-img"
                  src={this.state.preview}
                />
              ) : (
                  "Choose or drop a file."
                )}
              <canvas id="canvas" />
            </MagicDropzone>
          ) : (
              <div className="Dropzone">Loading model...</div>
            )}
          {console.log(this.state.model)}
          <div className="Members">
            <h3>Project made by -</h3>
            <ol>
              <li>Ritesh Kumar Jha</li>
              <li>Abhay Pratap Singh</li>
              <li>Anurag Dixit</li>
            </ol>
          </div>
          <a href='/classes' className="list-class">List of classes which our app can detect</a>
        </div>
      </div>
    );
  }
}

export default App;
