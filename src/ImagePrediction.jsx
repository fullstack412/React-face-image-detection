import React from 'react';
import Clarifai from 'clarifai';
import ReactModal from 'react-modal';

import config from './config';
import './style.css';

const app = new Clarifai.App({
  apiKey: config.CLARIFAI_API_KEY
});

const boundBoxStyle = {
  position: 'absolute',
  boxShadow: '0 0 0 3px #149df2 inset',
  display: 'flex',
  flexWrap: 'wrap',
  flexPpack: 'center',
  justifyContent: 'center',
  cursor: 'pointer'
};

const mediaViewStyle = {
  flex: '1 1 auto',
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
  position: 'relative',
};

const imageViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
};

const boxContainer = {
  position: 'absolute',
  display: 'flex',
  width: '100%',
  height: '100%'
};

const buttonStyle = {
  display: 'flex',
  width: '50%',
  left: '50%',
  bottom: 8,
  height: 44,
  padding: '0 11px',
  borderRadius: 2,
  backgroundColor: '#009cff',
  boxShadow: '0 2px 8px 0 rgba(27, 38, 52, 0.36)',
  border: 'solid 1px rgba(27, 38, 52, 0.24)',
  fontWeight: 'bold',
  lineHeight: 1.23,
  letterSpacing: 0.4,
  color: '#ffffff',
  textTransform: 'uppercase',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  margin: 'auto',
  marginBottom: 10,
};

const loadingStyle = {
  margin: 'auto',
  minHeight: 360,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    textAlign             : 'center',
    lineHeight            : 2
  }
};

class Modal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      url: '',
      modalOpen: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
  }

  handleChange(e) {
    this.setState({ url: e.target.value });
  }

  handleSelect() {
    this.props.onSelect('url', this.state.url);
  }

  handleCancel() {
    this.props.onCancel();
  }

  handleFileChange(e) {
    var files = e.target.files; // FileList object

    // Only process image files.
    if (!files[0].type.match('image.*')) {
      alert('Please select image file.');
      return;
    }

    var reader = new FileReader();
    const controller = this;

    // Closure to capture the file information.
    reader.onload = (function(theFile) {
      return function(e) {
        // Render thumbnail.
        controller.props.onSelect('bytes', e.target.result);
      };
    })(files[0]);

    // Read in the image file as a data URL.
    reader.readAsDataURL(files[0]);
  }

  componentDidUpdate(prevProps) {
    if (this.props.modalOpen !== prevProps.modalOpen) {
      this.setState({ modalOpen: this.props.modalOpen });
    }
  }

  render() {
    const { isOpen } = this.props;

    return (
      <ReactModal
        isOpen={isOpen}
        contentLabel="Select Image"
        style={customStyles}
      >
        <div>
          <label>Copy & Paste an Image URL here&nbsp;</label>
          <input type="text" name="name" onChange={this.handleChange} />
          <button disabled={!this.state.url} onClick={() => this.handleSelect()}>Select</button>
          <button onClick={() => this.handleCancel()}>Cancel</button>
        </div>
        <label>Or&nbsp;</label>
        <input type="file" name="file" onChange={this.handleFileChange} />
      </ReactModal>
    );
  }
}

class ImagePrediction extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data || 'https://clarifai.com/cms-assets/20180320221615/face-002.jpg',
      type: props.type,
      regions: [],
      loading: false,
      imageSize: {
        width: 0,
        height: 0
      }
    };

    this.predictImage = this.predictImage.bind(this);
  }

  componentDidMount() {
    this.predictImage();
  }

  componentDidUpdate(prevProps) {
    if (this.props.data !== prevProps.data) {
      this.setState({ type: this.props.type, data: this.props.data }, () => this.predictImage());
    }
  }

  predictImage() {

    this.setState({ loading: true });

    const controller = this;
    let img = new Image();
    img.onload = function() {
      controller.setState({ imageSize: {
        width: this.width,
        height: this.height
      }});
    };
    img.src = this.state.data;

    const inputs = this.state.type === 'url'
      ? this.state.data
      : { base64: this.state.data };
      
    app.models.predict(Clarifai.FACE_DETECT_MODEL, inputs)
      .then((res) => {
        const { regions } = res.outputs[0].data;
        this.setState({
          regions,
          loading: false
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({ loading: false });
      });
  }

  render() {
    const { data, regions, loading, imageSize } = this.state;

    if (loading) {
      return (
        <div style={loadingStyle}>Loading...</div>
      )
    }

    return (
      <div style={mediaViewStyle}>
        <div style={imageViewStyle}>
          <img draggable={false} id="image-view-content" src={data} />
        </div>
        <div style={boxContainer}>
          <div style={{ position: 'relative', margin: 'auto', ...imageSize }}>
            {regions.map((region, id) => {
              const { top_row: top, bottom_row: bottom, left_col: left, right_col: right } = region.region_info.bounding_box;

              return(
                <div key={id}>
                  <div
                    style={{
                      ...boundBoxStyle,
                      top: `${top * 100}%`,
                      right: `${100 - right * 100}%`,
                      left: `${left * 100}%`,
                      bottom: `${100 - bottom * 100}%`
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalOpen: false,
      url: '',
      bytes: null,
      type: 'url'
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({ url: e.target.value });
  }

  render() {
    const { modalOpen, type, url, bytes } = this.state;

    const data = type === 'url' ? url : bytes;

    return (
      <div id="media-explorer" style={{width: '100vw', height: '100vh', textAlign: 'center' }}>
        <Modal
          isOpen={modalOpen}
          onSelect={(t, d) => this.setState({ type: t, [t]: d, modalOpen: false })}
          onCancel={() => this.setState({ modalOpen: false })}
        />
        <button style={buttonStyle} onClick={() => this.setState({ modalOpen: true })}>
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26"><g fill="none" fill-rule="evenodd"><path stroke="#FFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H1v20h20V13M21 1v8M25 5h-8"></path><path stroke="#FFF" stroke-linejoin="round" stroke-width="2" d="M15 14l-6 6-3-3-5 5v3h20v-5z"></path><path fill="#FFF" d="M8 10a2 2 0 1 1-4.001-.001A2 2 0 0 1 8 10"></path></g></svg>
          Select Your own Image
        </button>
        <ImagePrediction type={type} data={data} />
      </div>      
    );
  }
}