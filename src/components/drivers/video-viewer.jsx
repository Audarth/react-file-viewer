// Copyright (c) 2017 PlanGrid, Inc.

import React, { Component } from 'react';

import 'styles/video.scss';

class VideoViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    if (this.props.data) {
      console.log(this.props.data);
      const uInt8Array = new Uint8Array(this.props.data);
      const blob = new window.Blob([uInt8Array], {
        type: `video/${this.props.fileType}`,
      });
      const url = window.URL.createObjectURL(blob);
      this.setState({ dataUrl: url });
    }
  }

  componentWillUnmount() {
    window.URL.revokeObjectURL(this.state.dataUrl);
  }

  onCanPlay() {
    this.setState({ loading: false });
  }

  render() {
    const visibility = this.state.loading ? 'hidden' : 'visible';
    //
    if (this.state.dataUrl) {
      //
      return (
        <div className="pg-driver-view">
          <div className="video-container">
            <video
              style={{ visibility }}
              controls
              type={`video/${this.props.fileType}`}
              onCanPlay={e => this.onCanPlay(e)}
              src={this.state.dataUrl}
              onError={event => console.log(event.target.error)}
            >
              Video playback is not supported by your browser.
            </video>
          </div>
        </div>
      );
    }
    return (
      <div className="pg-driver-view">
        <div className="video-container" />
      </div>
    );
  }
}

export default VideoViewer;
