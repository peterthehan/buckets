import React, { Component } from 'react';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import { List, ListItem } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import Slider from 'material-ui/Slider';
import Snackbar from 'material-ui/Snackbar';
import Subheader from 'material-ui/Subheader';
import TextField from 'material-ui/TextField';

import Clipboard from 'clipboard';
new Clipboard('.btn');

import Palette from '../palette.js';

const style = {
  parent: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '48px'
  },
  column: {
    display: 'flex',
    flex: '0 1 700px',
    flexWrap: 'wrap'
  },
  list: {
    flex: '1 1 200px',
    margin: '16px',
    padding: '0px'
  },
  card: {
    flex: '2 1 400px',
    margin: '16px'
  }
};

export default class Home extends Component {
  state = {
    buckets: 2,
    duplicates: 0,
    errorText: '',
    filename: '',
    list: null,
    message: '',
    open: false,
    snackbarDuration: 0,
    time: 0,
    url: 'https://pbs.twimg.com/media/CvteKFjVUAEMNz3.png'
  };

  componentWillMount = () => this.renderList();

  handleBrowse = event => {
    if (event.target.files[0] !== undefined) {
      const file = event.target.files[0].name;
      const reader = new FileReader();
      reader.onloadend = () =>
        this.setState({ filename: file, url: reader.result });
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  handleTextField = event => {
    if (event.target.value !== '') {
      if (
        event.target.value.endsWith('.png') ||
        event.target.value.endsWith('.jpg')
      ) {
        const error = this.isURLValid(event.target.value);
        if (error === 1) {
          this.setState({ errorText: '', url: event.target.value });
        } else if (error === 0) {
          this.setState({ errorText: 'Invalid url.' });
        } else if (error === -1) {
          this.setState({
            errorText: `No 'Access-Control-Allow-Origin' header is present on the requested resource.`
          });
        }
      } else {
        this.setState({ errorText: 'Only JPG and PNG formats are supported.' });
      }
    } else {
      this.setState({ errorText: 'Enter a url.' });
    }
  };

  isURLValid = url => {
    const http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    try {
      http.send();
    } catch (error) {
      console.error(error);
      return -1;
    }
    return http.status === 404 ? 0 : 1;
  };

  handleTextFieldFocus = event => event.target.select();

  handleSlider = (event, value) => this.setState({ buckets: value });

  handleQuantize = () => {
    const ti = performance.now();
    this.renderList()
      .then(() => {
        const time = performance.now() - ti;
        this.setState({
          message: `Took ${Math.round(time)} ms.${
            this.state.duplicates === 0
              ? ''
              : ` Removed ${this.state.duplicates} duplicate bucket${
                  this.state.duplicates === 1 ? '' : 's'
                }.`
          }`,
          open: true,
          snackbarDuration: 5000,
          time: time
        });
        //window.scrollTo(0, 0);
      })
      .catch(error => console.error(error));
  };

  renderList = () => {
    return Palette.load(this.state.url)
      .then(pixels => Palette.medianCut(pixels, this.state.buckets))
      .then(buckets => Palette.sortByLuminance(buckets))
      .then(buckets => {
        const uniqueBuckets = this.removeDuplicates(buckets);
        let list = [];
        for (let i = 0; i < uniqueBuckets.length; ++i) {
          const pixel = uniqueBuckets[i];
          const rgb = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;
          const hex = this.rgbToHex(pixel);
          list.push(
            <ListItem
              key={i}
              nestedItems={[
                <div key={i}>
                  {this.renderListItem(rgb)}
                  <Divider />
                  {this.renderListItem(hex)}
                </div>
              ]}
              nestedListStyle={{ padding: '0px' }}
              primaryTogglesNestedList={true}
              style={{ backgroundColor: rgb, height: '48px' }}
            />
          );
        }
        this.setState({
          duplicates: buckets.length - uniqueBuckets.length,
          list: <Paper>{list}</Paper>
        });
      })
      .catch(error => console.error(error));
  };

  removeDuplicates = list => {
    const unique = [...new Set(list.map(i => JSON.stringify(i)))];
    return unique.map(i => JSON.parse(i));
  };

  rgbToHex = pixel => {
    let r = pixel.r.toString(16);
    let g = pixel.g.toString(16);
    let b = pixel.b.toString(16);
    r = r.length === 1 ? '0' + r : r;
    g = g.length === 1 ? '0' + g : g;
    b = b.length === 1 ? '0' + b : b;
    return '#' + r + g + b;
  };

  renderListItem = str => {
    return (
      <ListItem
        primaryText={str}
        rightIconButton={
          <IconButton
            className="btn"
            data-clipboard-text={str}
            onTouchTap={this.handleCopy}
          >
            <FontIcon className="material-icons">content_copy</FontIcon>
          </IconButton>
        }
      />
    );
  };

  handleCopy = () =>
    this.setState({ message: 'Copied!', open: true, snackbarDuration: 2500 });

  handleSnackbar = () => this.setState({ open: !this.state.open });

  render() {
    return (
      <div style={style.parent}>
        <div style={style.column}>
          <List style={style.list}>{this.state.list}</List>
          <Paper style={style.card}>
            <img
              role="presentation"
              src={this.state.url}
              style={{ verticalAlign: 'top', width: '100%' }}
            />
            <div style={{ fontSize: '14px', padding: '16px' }}>
              <div style={{ display: 'flex' }}>
                <div>
                  <RaisedButton
                    containerElement="label"
                    label="Browse"
                    style={{ marginRight: '8px' }}
                  >
                    <input
                      accept=".jpg,.png"
                      onChange={this.handleBrowse}
                      style={{ display: 'none' }}
                      type="file"
                    />
                  </RaisedButton>
                </div>
                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    wordBreak: 'break-all'
                  }}
                >
                  {this.state.filename}
                </div>
              </div>
              <TextField
                defaultValue={this.state.url}
                errorText={this.state.errorText}
                floatingLabelText="url"
                id="url"
                multiLine={true}
                onChange={this.handleTextField}
                onFocus={this.handleTextFieldFocus}
                style={{ width: '100%' }}
              />
              <Subheader
                style={{
                  fontSize: '16px',
                  padding: '0px',
                  transform: 'scale(0.75)',
                  transformOrigin: 'left bottom 0px'
                }}
              >
                buckets
              </Subheader>
              <div style={{ display: 'flex' }}>
                <Slider
                  defaultValue={this.state.buckets}
                  min={0}
                  max={4}
                  onChange={this.handleSlider}
                  step={1}
                  style={{ flex: '8', marginRight: '8px' }}
                  value={this.state.buckets}
                />
                <TextField
                  disabled={true}
                  id="slider"
                  inputStyle={{ color: 'black', textAlign: 'center' }}
                  style={{ flex: '1' }}
                  value={Math.pow(2, this.state.buckets)}
                />
              </div>
            </div>
            <div style={{ padding: '8px' }}>
              <FlatButton label="QUANTIZE" onTouchTap={this.handleQuantize} />
            </div>
          </Paper>
          <Snackbar
            autoHideDuration={this.state.snackbarDuration}
            message={this.state.message}
            onRequestClose={this.handleSnackbar}
            open={this.state.open}
          />
        </div>
      </div>
    );
  }
}
