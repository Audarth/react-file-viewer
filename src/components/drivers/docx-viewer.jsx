// Copyright (c) 2017 PlanGrid, Inc.

import React, { Component } from 'react';
import mammoth from 'mammoth';

import 'styles/docx.scss';
import Loading from '../loading';
import Error from '../error';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  componentDidMount() {
    const jsonFile = new XMLHttpRequest();
    jsonFile.open('GET', this.props.filePath, true);
    jsonFile.send();
    jsonFile.responseType = 'arraybuffer';

    jsonFile.onreadystatechange = () => {
      if (jsonFile.readyState === 4) {
        if (jsonFile.status === 200) {
          mammoth
            .convertToHtml(
              { arrayBuffer: jsonFile.response },
              { includeDefaultStyleMap: true },
            )
            .then(result => {
              const docEl = document.createElement('div');
              docEl.className = 'document-container';
              docEl.innerHTML = result.value;
              document.getElementById('docx').innerHTML = docEl.outerHTML;
            })
            .catch(a => {
              console.log('alexei: something went wrong', a);
            })
            .done();
        } else {
          this.setState(() => {
            var arrayBuffer = jsonFile.response;
            if (arrayBuffer) {
              var dataView = new DataView(arrayBuffer);
              // The TextDecoder interface is documented at http://encoding.spec.whatwg.org/#interface-textdecoder
              // eslint-disable-next-line no-undef
              var decoder = new TextDecoder('utf-8');
              var decodedString = decoder.decode(dataView);
              var obj = JSON.parse(decodedString);
              //throw new Error(obj.errorResponse.status);
              this.setState({ error: obj.errorResponse.status });
            }
          });
        }
      }
    };
  }

  render() {
    if (this.state.error) {
      return <Error {...this.props} error={this.state.error} />;
    } else {
      return (
        <div id="docx">
          <Loading />
        </div>
      );
    }
  }
}
