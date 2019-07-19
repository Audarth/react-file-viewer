// Copyright (c) 2017 PlanGrid, Inc.

import React, { Component } from 'react';

import ReactDataGrid from 'react-data-grid';
import CSV from 'comma-separated-values';

class CsvViewer extends Component {
  static parse(data) {
    const rows = [];
    const columns = [];
    let maxColumnIndex = null;

    new CSV(data, { cast: false }).forEach(array => {
      if (columns.length < 1) {
        maxColumnIndex = array.length - 1;

        let emptyStringCheck = 0;
        for (let i = 0; i < array.length; i += 1) {
          if (array[i] === '') {
            emptyStringCheck += 1;
          } else {
            emptyStringCheck = 0;
          }
          if (emptyStringCheck >= 50) {
            maxColumnIndex = i;
            break;
          }
          columns.push({
            key: `key-${i}`,
            name: array[i],
            resizable: true,
            sortable: false,
            filterable: false,
          });
        }
      } else {
        const row = {};

        for (let i = 0; i < array.length; i += 1) {
          if (i > maxColumnIndex) {
            break;
          }
          row[`key-${i}`] = array[i];
        }
        rows.push(row);
      }
    });

    return { rows, columns };
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    if (this.props.data) {
      this.setState(CsvViewer.parse(this.props.data));
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(CsvViewer.parse(nextProps.data));
  }

  render() {
    const { rows, columns } = this.state;
    if (rows && columns) {
      return (
        <ReactDataGrid
          columns={columns}
          rowsCount={rows.length}
          rowGetter={i => rows[i]}
          minHeight={this.props.height || 650}
        />
      );
    }
    return <div />;
  }
}

export default CsvViewer;
