/* eslint-disable comma-dangle */
// Copyright (c) 2017 PlanGrid, Inc.

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import 'styles/main.scss';
import withFetching from './fetch-wrapper';

import Error from './error';

import {
  CsvViewer,
  DocxViewer,
  VideoViewer,
  XlsxViewer,
  XBimViewer,
  PDFViewer,
  UnsupportedViewer,
  PhotoViewerWrapper,
  AudioViewer,
} from './drivers';

class FileViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      hasError: false,
      errorDetails: {},
    };
  }

  componentDidMount() {
    this.setContainerSize();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.filePath !== this.props.filePath ||
      prevProps.fileType !== this.props.fileType
    ) {
      this.setState({
        loading: true,
        hasError: false,
        errorDetails: {},
      });
      this.setContainerSize();
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorDetails: error };
  }

  setContainerSize() {
    const container = document.getElementById('pg-viewer');
    const height = container ? container.clientHeight : 0;
    const width = container ? container.clientWidth : 0;
    this.setState({ height: height, width: width });
  }

  getDriver() {
    switch (this.props.fileType) {
      case 'csv': {
        return withFetching(CsvViewer, this.props);
      }
      case 'xlsx': {
        const newProps = Object.assign({}, this.props, {
          responseType: 'arraybuffer',
        });
        return withFetching(XlsxViewer, newProps);
      }
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp':
      case 'png': {
        const newProps = Object.assign({}, this.props, {
          responseType: 'arraybuffer',
        });
        return withFetching(PhotoViewerWrapper, newProps);
      }
      case 'pdf': {
        const newProps = Object.assign({}, this.props, {
          responseType: 'arraybuffer',
        });
        return withFetching(PDFViewer, newProps);
      }
      case 'docx': {
        return DocxViewer;
      }
      case 'mp3': {
        const newProps = Object.assign({}, this.props, {
          responseType: 'arraybuffer',
        });
        return withFetching(AudioViewer, newProps);
        //return AudioViewer;
      }
      case 'webm':
      case 'mp4': {
        const newProps = Object.assign({}, this.props, {
          responseType: 'arraybuffer',
        });
        return withFetching(VideoViewer, newProps);
      }
      case 'wexbim': {
        return XBimViewer;
      }
      default: {
        return UnsupportedViewer;
      }
    }
  }

  render() {
    const Driver = this.getDriver(this.props);
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <Error {...this.props} error={this.state.errorDetails.message} />;
    } else {
      return (
        <div className="pg-viewer-wrapper">
          <div className="pg-viewer" id="pg-viewer">
            <Driver
              {...this.props}
              width={this.state.width}
              height={this.state.height}
            />
          </div>
        </div>
      );
    }
  }
}

FileViewer.propTypes = {
  fileType: PropTypes.string.isRequired,
  filePath: PropTypes.string.isRequired,
  onError: PropTypes.func,
  errorComponent: PropTypes.func,
  unsupportedComponent: PropTypes.func,
};

FileViewer.defaultProps = {
  onError: () => null,
  errorComponent: null,
  unsupportedComponent: null,
};

export default FileViewer;
module.exports = FileViewer;
