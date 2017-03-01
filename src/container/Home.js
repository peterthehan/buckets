import React, {Component} from 'react';
import {Card, CardActions, CardMedia, CardText} from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import {List, ListItem} from 'material-ui/List';
import Paper from 'material-ui/Paper';
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
    marginBottom: '48px',
  },
  column: {
    display: 'flex',
    flex: '0 1 700px',
    flexWrap: 'wrap',
  },
  list: {
    flex: '1 1 200px',
    margin: '16px',
    padding: '0px',
  },
  card: {
    flex: '2 1 400px',
    margin: '16px',
  },
};

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buckets: 2,
      errorText: '',
      list: null,
      duplicates: 0,
      processTime: 0,
      showSnackbar: false,
      snackbarDuration: 1000,
      snackbarText: '',
      url: 'https://pbs.twimg.com/media/CvteKFjVUAEMNz3.png',
    };
    this.handleTextField = this.handleTextField.bind(this);
    this.handleSlider = this.handleSlider.bind(this);
    this.handleButton = this.handleButton.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handleSnackbar = this.handleSnackbar.bind(this);
  }

  componentWillMount() {
    this.renderList();
  }

  handleTextField(event) {
    if (event.target.value !== '') {
      if (event.target.value.endsWith('.png') || event.target.value.endsWith('.jpg')) {
        if (this.isURLValid(event.target.value)) {
          this.setState({errorText: '', url: event.target.value,});
        } else {
          this.setState({errorText: 'Invalid url.'});
        }
      } else {
        this.setState({errorText: 'Only JPG and PNG formats are supported.'});
      }
    } else {
      this.setState({errorText: 'Enter a url.'});
    }
  }

  isURLValid(url) {
    const http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status !== 404;
  }

  handleTextFieldFocus(event) {
    event.target.select();
  }

  handleSlider(event, value) {
    this.setState({buckets: value});
  }

  handleButton() {
    const ti = performance.now();
    new Promise((resolve, reject) => {
      this.renderList(resolve)
    })
    .then(() => {
      this.setState({
        processTime: performance.now() - ti,
      }, () => {
        this.setState({
          showSnackbar: true,
          snackbarDuration: 5000,
          snackbarText: `Took ${Math.round(this.state.processTime)} ms. Removed ${this.state.duplicates} ${this.state.duplicates === 0 ? '' : 'duplicate'} bucket${this.state.duplicates === 1 ? '' : 's'}.`,
        });
      });
      // window.scrollTo(0, 0);
    })
    .catch((error) => console.error(error));
  }

  renderList(resolve) {
    Palette.load(this.state.url)
    .then((pixels) => Palette.medianCut(pixels, this.state.buckets))
    .then((buckets) => Palette.sortByLuminance(buckets))
    .then((buckets) => {
      buckets = this.removeDuplicates(buckets);
      let list = [];
      for (let i = 0; i < buckets.length; ++i) {
        const rgb = this.toRGB(buckets[i]);
        list.push(
          <Paper key={i}>
            <ListItem
              key={i}
              nestedItems={[
                <div key={i}>
                  {this.renderListItem(rgb)}
                  <Divider />
                  {this.renderListItem(this.convertRGBToHex(buckets[i]))}
                </div>
              ]}
              nestedListStyle={{padding: '0px',}}
              style={{backgroundColor: rgb, height: '48px',}}
            />
          </Paper>
        );
      }
      this.setState({list: <List style={style.list}>{list}</List>});
      resolve(0);
    })
    .catch((error) => console.error(error));
  }

  handleCopy() {
    this.setState({
      showSnackbar: true,
      snackbarDuration: 2500,
      snackbarText: 'Copied!',
    });
  }

  renderListItem(str) {
    return (
      <ListItem
        primaryText={str}
        rightIconButton={
          <IconButton
            className='btn' data-clipboard-text={str}
            onClick={this.handleCopy}
          >
            <FontIcon className='material-icons'>content_copy</FontIcon>
          </IconButton>
        }
      />
    );
  }

  removeDuplicates(list) {
    const unique = [...new Set(list.map((i) => JSON.stringify(i)))];
    this.setState({duplicates: list.length - unique.length});
    return unique.map((i) => JSON.parse(i));
  }

  toRGB(pixel) {
    return `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;
  }

  convertRGBToHex(pixel) {
    return `#${pixel.r.toString(16)}${pixel.g.toString(16)}${pixel.b.toString(16)}`;
  }

  handleSnackbar() {
    this.setState({showSnackbar: !this.state.showSnackbar});
  }

  render() {
    return (
      <div style={style.parent}>
        <div style={style.column}>
          {this.state.list}
          <div style={style.card}>
            <Card>
              <CardMedia>
                <img role='presentation' src={this.state.url} />
              </CardMedia>
              <CardText>
                <TextField
                  defaultValue={this.state.url}
                  errorText={this.state.errorText}
                  floatingLabelText='url'
                  id='url'
                  multiLine={true}
                  onChange={this.handleTextField}
                  onFocus={this.handleTextFieldFocus}
                  style={{width: '100%',}}
                />
                <Subheader style={{padding: '0px',}}>buckets</Subheader>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <Slider
                    defaultValue={this.state.buckets}
                    min={0}
                    max={4}
                    onChange={this.handleSlider}
                    step={1}
                    style={{flex: '7 1', marginRight: '8px'}}
                    value={this.state.buckets}
                  />
                  <TextField
                    id="slider"
                    inputStyle={{color: 'black', textAlign: 'center'}}
                    disabled={true}
                    style={{flex: '1 1', marginLeft: '8px'}}
                    value={Math.pow(2, this.state.buckets)}
                  />
                </div>
              </CardText>
              <CardActions>
                <FlatButton label='QUANTIZE' onTouchTap={this.handleButton} />
              </CardActions>
            </Card>
          </div>
        </div>
        <Snackbar
          autoHideDuration={this.state.snackbarDuration}
          message={this.state.snackbarText}
          onRequestClose={this.handleSnackbar}
          open={this.state.showSnackbar}
        />
      </div>
    );
  }
}
