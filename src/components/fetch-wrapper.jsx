// Copyright (c) 2017 PlanGrid, Inc.

import React, { Component } from 'react';

import Error from './error';
import Loading from './loading';

function withFetching(WrappedComponent, props) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = {};
      this.xhr = true;
    }

    componentDidMount() {
      this.xhr = this.createRequest(props.filePath);
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

    render() {
      if (!this.xhr) {
        return <h1>CORS not supported..</h1>;
      }

      if (this.state.error) {
        return <Error {...this.props} error={this.state.error} />;
      }

      if (this.state.data) {
        return <WrappedComponent data={this.state.data} {...this.props} />;
      }
      return <Loading />;
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
      if (props.responseType) {
        xhr.responseType = props.responseType;
      }

      xhr.onload = () => {
        if (xhr.status >= 400) {
          console.log(xhr);
          if (xhr.responseType === 'arraybuffer') {
            const arrayBuffer = xhr.response;

            if (arrayBuffer) {
              var dataView = new DataView(arrayBuffer);
              // The TextDecoder interface is documented at http://encoding.spec.whatwg.org/#interface-textdecoder
              // eslint-disable-next-line no-undef
              var decoder = new TextDecoder('utf-8');
              const decodedString = decoder.decode(dataView);
              const obj = JSON.parse(decodedString);

              this.setState({ error: obj.errorResponse.status });
              return;
              //throw new Error(obj.errorResponse.status);
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
        const resp = props.responseType ? xhr.response : xhr.responseText;

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
  };
}

export default withFetching;
