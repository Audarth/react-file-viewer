// Copyright (c) 2017 PlanGrid, Inc.

import React, { Component } from 'react';
import encoding from 'text-encoding';

import Error from './error';
import Loading from './loading';

class withFetching extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.xhr = true;
  }

  componentDidMount() {
    this.xhr = this.createRequest(this.props.filePath);
    try {
      this.fetch();
    } catch (e) {
      if (this.props.onError) {
        this.props.onError(e);
      }
      this.setState({ error: 'fetch error' });
    }
  }

  componentWillUnmount() {
    this.abort();
  }

  createRequest(path) {
    let xhr = new XMLHttpRequest();

    if ('withCredentials' in xhr) {
      // XHR for Chrome/Firefox/Opera/Safari.
      xhr.open('GET', path, true);
    } else if (typeof XDomainRequest !== 'undefined') {
      // XDomainRequest for IE.
      xhr = new XDomainRequest();
      xhr.open('GET', path);
    } else {
      // CORS not supported.
      xhr = null;
      return null;
    }
    if (this.props.responseType) {
      xhr.responseType = this.props.responseType;
    }

    xhr.onload = () => {
      if (xhr.status >= 400) {
        if (xhr.responseType === 'arraybuffer') {
          const arrayBuffer = xhr.response;

          if (arrayBuffer) {
            const dataView = new DataView(arrayBuffer);

            const decoder = new encoding.TextDecoder();

            const decodedString = decoder.decode(dataView);
            const obj = JSON.parse(decodedString);

            this.setState({ error: obj.errorResponse.status });
            return;
          }
        } else if (xhr.responseType === '') {
          const decodedString = xhr.responseText;
          const obj = JSON.parse(decodedString);

          this.setState({ error: obj.errorResponse.status });
          return;
        } else {
          this.setState({ error: `fetch error with status ${xhr.status}` });
          return;
        }
      }
      const resp = this.props.responseType ? xhr.response : xhr.responseText;

      this.setState({ data: resp });
    };

    return xhr;
  }

  fetch() {
    this.xhr.send();
  }

  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }
  render() {
    if (!this.xhr) {
      return <h1>CORS not supported..</h1>;
    }

    if (this.state.error) {
      return <Error {...this.props} error={this.state.error} />;
    }

    if (this.state.data) {
      return (
        <this.props.WrappedComponent data={this.state.data} {...this.props} />
      );
    }
    return <Loading />;
  }
}

export default withFetching;
