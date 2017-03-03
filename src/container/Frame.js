import React, {Component} from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {blueGrey500} from 'material-ui/styles/colors';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import Header from '../component/Header';

const muiTheme = getMuiTheme({
  appBar: {
    color: blueGrey500,
  },
  slider: {
    selectionColor: blueGrey500,
    rippleColor: blueGrey500,
  },
  textField: {
    focusColor: blueGrey500,
  },
});

export default class Frame extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Header />
          {this.props.children}
        </div>
      </MuiThemeProvider>
    );
  }
}
