'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import BackgroundVideo from 'react-background-video-player';
import TransitionGroup from 'react-transition-group-plus';
import animate from 'gsap';
import SVGInline from 'react-svg-inline';

import secondsToTime from '../../util/seconds-to-minutes';
import fullScreen from 'fullscreen-handler';

import playIcon from '../../../raw-assets/svg/play.svg';
import pauseIcon from '../../../raw-assets/svg/pause.svg';
import mutedIcon from '../../../raw-assets/svg/muted.svg';
import unMutedIcon from '../../../raw-assets/svg/unmuted.svg';
import enterFsIcon from '../../../raw-assets/svg/enter-fullscreen.svg';
import exitFsIcon from '../../../raw-assets/svg/exit-fullscreen.svg';
import closeIcon from '../../../raw-assets/svg/close.svg';
import captionsOnIcon from '../../../raw-assets/svg/captions-on.svg';
import captionsOffIcon from '../../../raw-assets/svg/captions-off.svg';

import VideoTimeline from './VideoTimeline{{#if sectionNames}}/VideoTimeline{{/if}}';
import VideoPoster from './VideoPoster{{#if sectionNames}}/VideoPoster{{/if}}';

export default class VideoPlayer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      containerWidth: props.windowWidth || 0,
      containerHeight: props.windowHeight || 0,
      isPlaying: false,
      isMuted: props.muted,
      isFullScreen: false,
      isShowingCaptions: props.captions && props.captions.default,
      currentCaptions: '',
      currentTime: 0,
      progress: 0,
      duration: 0,
      startTime: props.startTime,
    };
  }

  componentDidMount() {
    this.fullScreen = fullScreen(this.container, this.handleEnterFullScreen, this.handleExitFullScreen);

    if (this.props.hasControls) {
      this.props.showControlsOnLoad ? this.setHideControlsTimeout() : this.hideControls(0);
    }

    if (this.props.autoPlay) {
      this.autoPlayTimeout = setTimeout(() => {
        this.play();
        this.clearAutoPlayTimeout();
      }, this.props.autoPlayDelay);
    }

    if (this.props.captions) {
      animate.set(this.captionsContainer, {autoAlpha: Boolean(this.state.isShowingCaptions)});
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.windowWidth !== this.props.windowWidth || nextProps.windowHeight !== this.props.windowHeight) {
      this.handleResize({
        containerWidth: nextProps.windowWidth,
        containerHeight: nextProps.windowHeight
      });
    }

    if (nextProps.startTime !== this.props.startTime) {
      this.setState({startTime: nextProps.startTime});
    }

    if (nextProps.captions && (nextProps.captions.src !== this.props.captions.src)) {
      this.setCaptions(nextProps.captions);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.isPlaying !== this.state.isPlaying) {
      if (this.state.isPlaying) {
        this.props.onPlay(this.props.id);
        this.props.hasControls && this.setHideControlsTimeout();
      } else {
        this.props.onPause(this.props.id);
        if (this.props.hasControls) {
          this.clearHideControlsTimeout();
          this.showControls();
        }
      }
    }

    if (prevState.isShowingCaptions !== this.state.isShowingCaptions) {
      this.captions &&
      animate.to(this.captionsContainer, 0.1, {autoAlpha: Boolean(this.state.isShowingCaptions)});
    }
  }

  componentWillUnmount() {
    this.fullScreen.destroy();
    this.pause();
    this.clearAutoPlayTimeout();
    this.props.hasControls && this.clearHideControlsTimeout();
    this.captions && this.captions.removeEventListener('cuechange', this.handleTrackChange);
  }

  showControls = (dur = 0.8, ease = Expo.easeOut) => {
    this.closeButton && animate.to(this.closeButton, dur, {y: '0%', ease});
    this.controls && animate.to(this.controls, dur, {y: '0%', ease});
  };

  hideControls = (dur = 0.8, ease = Expo.easeOut) => {
    this.closeButton && animate.to(this.closeButton, dur, {y: '-100%', ease});
    this.controls && animate.to(this.controls, dur, {y: '100%', ease});
  };

  getVideoElement = () => {
    return this.video.video;
  };

  play = () => {
    !this.state.isPlaying && this.video.play();
  };

  pause = () => {
    this.state.isPlaying && this.video.pause();
  };

  mute = () => {
    !this.state.isMuted && this.video.mute();
  };

  unmute = () => {
    this.state.isMuted && this.video.unmute();
  };

  togglePlay = () => {
    this.video.togglePlay();
  };

  toggleMute = () => {
    this.video.toggleMute();
  };

  toggleFullScreen = () => {
    this.state.isFullScreen ? this.fullScreen.exit() : this.fullScreen.enter();
  };

  toggleCaptions = () => {
    this.setState({isShowingCaptions: !this.state.isShowingCaptions});
  };

  setCaptions = (captions = this.props.captions) => {
    const video = this.video.video;
    if (video.contains(this.captions)) {
      video.removeChild(this.captions);
      this.captions.removeEventListener('cuechange', this.handleTrackChange);
    }

    const track = document.createElement('track');
    track.kind = captions.kind;
    track.label = captions.label;
    track.srclang = captions.srclang;
    track.default = captions.default;
    track.src = captions.src;
    track.mode = 'hidden';

    this.captions = track;
    video.appendChild(this.captions);
    video.textTracks[0].mode = 'hidden';

    this.captions.addEventListener('cuechange', this.handleTrackChange);
  };

  clearHideControlsTimeout = () => {
    if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
      this.hideControlsTimeout = undefined;
    }
  };

  clearAutoPlayTimeout = () => {
    this.autoPlayTimeout && clearTimeout(this.autoPlayTimeout);
  };

  setHideControlsTimeout = () => {
    this.clearHideControlsTimeout();
    this.hideControlsTimeout = setTimeout(() => {
      this.state.isPlaying && this.hideControls();
    }, this.props.controlsTimeout);
  };

  handleOnReady = () => {
    if (this.props.captions) {
      this.props.captions.src && this.setCaptions();
    }
  };

  handleTrackChange = () => {
    const trackList = this.video.video.textTracks;
    const textTracks = (trackList && trackList.length > 0) ? trackList[0] : null;
    let cue = (textTracks && textTracks.activeCues.length > 0) ? textTracks.activeCues[0] : null;
    let text = cue ? cue.text : '';
    this.setState({currentCaptions: text});
  };

  handleResize = (newSize) => {
    this.setState(newSize);
  };

  handleEnterFullScreen = () => {
    this.setState({isFullScreen: true});
  };

  handleExitFullScreen = () => {
    this.setState({isFullScreen: false});
  };

  handleTimeChange = (currentTime) => {
    this.video.setCurrentTime(currentTime);
  };

  handlePlay = () => {
    this.setState({isPlaying: true});
  };

  handlePause = () => {
    this.setState({isPlaying: false});
  };

  handleTimeUpdate = (currentTime, progress, duration) => {
    this.setState({currentTime, progress, duration});
  };

  handleMute = () => {
    this.setState({isMuted: true});
  };

  handleUnmute = () => {
    this.setState({isMuted: false});
  };

  handleEnd = () => {
    this.props.onEnd();
    this.fullScreen.isFullScreen() && this.fullScreen.exit();
    this.props.showPosterOnEnd && this.hideControls();
  };

  handleOnMouseMove = (e) => {
    if (this.state.isPlaying && this.props.hasControls) {
      this.showControls();
      this.setHideControlsTimeout();
    }
  };

  handleKeyPress = (e) => {
    if (this.props.allowKeyboardControl) {
      const event = e.keyCode || e.which || e.charCode;
      if (event === 32) {
        this.togglePlay();
      }
    }
  };

  render() {
    const props = this.props;
    const state = this.state;

    return (
      <div
        className={`VideoPlayer ${props.className}`}
        style={props.style}
        ref={r => this.container = r}
        onMouseMove={this.handleOnMouseMove}
      >
        <BackgroundVideo
          ref={r => this.video = r}
          src={props.src}
          containerWidth={state.containerWidth}
          containerHeight={state.containerHeight}
          autoPlay={false}
          muted={props.muted}
          loop={props.loop}
          disableBackgroundCover={props.disableBackgroundCover}
          preload={props.preload}
          playsInline={props.playsInline}
          volume={props.volume}
          startTime={state.startTime}
          onReady={this.handleOnReady}
          onPlay={this.handlePlay}
          onPause={this.handlePause}
          onTimeUpdate={this.handleTimeUpdate}
          onMute={this.handleMute}
          onUnmute={this.handleUnmute}
          onEnd={this.handleEnd}
          onClick={props.togglePlayOnClick ? this.togglePlay : f => f}
          onKeyPress={this.handleKeyPress}
        />

        {
          props.poster &&
          <TransitionGroup>
            {
              (!state.isPlaying && (!state.progress || (props.showPosterOnEnd && state.progress >= 1))) &&
              <VideoPoster
                poster={props.poster}
                hasPlayButton={props.hasPlayButton}
                fadeDuration={props.posterFadeDuration}
                onClick={this.play}
              />
            }
          </TransitionGroup>
        }

        {
          props.hasCloseButton &&
          <button
            className="close"
            ref={r => this.closeButton = r}
            aria-label="Close Video"
            onClick={props.onClose}
          >
            <SVGInline svg={closeIcon}/>
          </button>
        }

        {
          props.hasControls &&
          <nav
            className="controls"
            ref={r => this.controls = r}
          >
            <button
              aria-label={state.isPlaying ? 'Pause Video' : 'Play Video'}
              onClick={this.togglePlay}
            >
              <SVGInline svg={state.isPlaying ? pauseIcon : playIcon}/>
            </button>

            <VideoTimeline
              duration={state.duration}
              currentTime={state.currentTime}
              onTimeChange={this.handleTimeChange}
            />

            {
              props.captions &&
              <div
                className="captions-container"
                ref={r => this.captionsContainer = r}
              >
                {this.state.currentCaptions && <p>{this.state.currentCaptions}</p>}
              </div>
            }

            <time tabIndex="0">
              {secondsToTime(this.state.currentTime)}
            </time>

            {
              props.captions &&
              <button
                aria-label={state.isShowingCaptions ? 'Hide Captions' : 'Show Captions'}
                onClick={this.toggleCaptions}
              >
                <SVGInline svg={state.isShowingCaptions ? captionsOnIcon : captionsOffIcon}/>
              </button>
            }

            <button
              aria-label={state.isMuted ? 'Unmute Video' : 'Mute Video'}
              onClick={this.toggleMute}
            >
              <SVGInline svg={state.isMuted ? mutedIcon : unMutedIcon}/>
            </button>

            <button
              aria-label={state.isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              onClick={this.toggleFullScreen}
            >
              <SVGInline svg={state.isFullScreen ? exitFsIcon : enterFsIcon}/>
            </button>
          </nav>
        }

      </div>
    );
  }
}

VideoPlayer.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  src: PropTypes.string.isRequired,
  poster: PropTypes.string,
  preload: PropTypes.string,
  captions: PropTypes.object,
  disableBackgroundCover: PropTypes.bool,
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  allowKeyboardControl: PropTypes.bool,
  autoPlay: PropTypes.bool,
  muted: PropTypes.bool,
  loop: PropTypes.bool,
  togglePlayOnClick: PropTypes.bool,
  showControlsOnLoad: PropTypes.bool,
  hasCloseButton: PropTypes.bool,
  hasPlayButton: PropTypes.bool,
  showPosterOnEnd: PropTypes.bool,
  hasControls: PropTypes.bool,
  playsInline: PropTypes.bool,
  autoPlayDelay: PropTypes.number,
  controlsTimeout: PropTypes.number,
  windowWidth: PropTypes.number,
  windowHeight: PropTypes.number,
  volume: PropTypes.number,
  startTime: PropTypes.number,
  posterFadeDuration: PropTypes.number,
  onPlay: PropTypes.func,
  onPause: PropTypes.func,
  onEnd: PropTypes.func,
  onClose: PropTypes.func,
};

VideoPlayer.defaultProps = {
  className: '',
  style: {},
  id: '',
  togglePlayOnClick: true,
  allowKeyboardControl: true,
  autoPlay: false,
  autoPlayDelay: 0, // in milliseconds
  muted: false,
  loop: false,
  hasControls: true,
  showPosterOnEnd: false,
  controlsTimeout: 2500, // in milliseconds
  showControlsOnLoad: false,
  disableBackgroundCover: true,
  hasCloseButton: false,
  hasPlayButton: true,
  preload: 'auto',
  playsInline: false,
  volume: 1,
  startTime: 0, // in seconds
  posterFadeDuration: 0, // in milliseconds
  onPlay: f => f,
  onPause: f => f,
  onEnd: f => f,
  onClose: f => f,
};
