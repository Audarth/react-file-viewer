// Copyright (c) 2017 PlanGrid, Inc.

import React, { Component } from 'react';
import XLSX from 'xlsx';

import CsvViewer from './csv-viewer';

class XlxsViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.setState(this.parse());
  }

  parse() {
    if (this.props.data) {
      const dataArr = new Uint8Array(this.props.data);
      const arr = [];

      for (let i = 0; i !== dataArr.length; i += 1) {
        arr.push(String.fromCharCode(dataArr[i]));
      }

      const workbook = XLSX.read(arr.join(''), { type: 'binary' });
      const names = Object.keys(workbook.Sheets);

      return { workbook, names, curSheetIndex: 0, curSheetName: names[0] };
    }
    return {};
  }

  renderSheetNames(names) {
    const sheets = names.map((name, index) => (
      <input
        className={
          this.state.curSheetName === name
            ? 'file-viewer-sheet-name file-viewer-sheet-name-current'
            : 'file-viewer-sheet-name'
        }
        key={name}
        type="button"
        value={name}
        onClick={() => {
          this.setState({ curSheetIndex: index, curSheetName: name });
        }}
      />
    ));

    return <div className="sheet-names">{sheets}</div>;
  }

  renderSheetData() {
    const csvProps = Object.assign({}, this.props);
    const data = XLSX.utils.sheet_to_csv(
      this.state.workbook.Sheets[this.state.curSheetName],
      { skipHidden: true, blankrows: false },
    );
    return <CsvViewer {...csvProps} data={data} />;
  }

  render() {
    if (this.state.workbook) {
      return (
        <div className="spreadsheet-viewer">
          {this.renderSheetNames(this.state.names)}
          {this.renderSheetData()}
        </div>
      );
    }
    return <div className="spreadsheet-viewer" />;
  }
}

export default XlxsViewer;
