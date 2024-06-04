import React, { Component, ChangeEvent } from 'react';
// @ts-ignore
import QrReader from 'react-qr-scanner';

interface TestState {
  delay: number;
  result: string;
}

class Test extends Component<{}, TestState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      delay: 100,
      result: 'No result',
    };

    this.handleScan = this.handleScan.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  handleScan(data: string | null) {
    if (data) {
      this.setState({
        result: data,
      });
    }
  }

  handleError(err: any) {
    console.error(err);
  }

  render() {
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    };

    const previewStyle: React.CSSProperties = {
      width: '80%',
      borderRadius: '6%',
    };

    return (
      <div style={containerStyle}>
        <QrReader
          delay={this.state.delay}
          style={previewStyle}
          onError={this.handleError}
          onScan={this.handleScan}
        />
        {/* <p>{this.state.result}</p> */}
      </div>
    );
  }
}

export default Test;
