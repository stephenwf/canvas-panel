import React, { Component } from 'react';
import {
  withBemClass,
  StaticImageViewport,
  FullPageViewport,
} from '@canvas-panel/core';
import CanvasDetail from '../CanvasDetail/CanvasDetail';
import './MobilePageView.scss';
import SlideShow from '../Slideshow/SlideShow';
import Slide from '../Slide/Slide';
import { Gesture, withGesture } from 'react-with-gesture';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import posed, { PoseGroup } from 'react-pose';
import Carousel from 'nuka-carousel';
import FlipMove from 'react-flip-move';

// const PosedImage = props => <div {...props} />;
//
// const PosedImage = posed.div({
//   flip: {
//     transition: { duration: 300 },
//   },
//   enter: {
//     opacity: 1,
//     transition: { duration: 0 },
//   },
//   exit: {
//     opacity: 0,
//     transition: { duration: 0 },
//   },
// });

class SimpleSlideTransition extends Component {
  render() {
    const { children, id, bem, timeout = 500 } = this.props;
    return (
      <TransitionGroup className={bem}>
        <CSSTransition
          key={id}
          timeout={{
            enter: 500,
            exit: 0,
          }}
          classNames="fade"
        >
          {children}
        </CSSTransition>
      </TransitionGroup>
    );
  }
}

class FullScreenMobilePageView extends Component {
  static defaultProps = {
    threshold: 150,
    onNext: () => null,
    onPrevious: () => null,
  };

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.props.down && nextProps.down === false) {
      if (nextProps.xDelta >= nextProps.threshold) {
        nextProps.onPrevious();
      }
      if (nextProps.xDelta <= -nextProps.threshold) {
        nextProps.onNext();
      }
    }
  }

  render() {
    const { down, xDelta, children } = this.props;

    return (
      <div
        style={{
          // transform: down
          //   ? `translate(${xDelta}px, ${0}px)`
          //   : `translate(0px, 0px)`,
          // transition: down ? null : 'transform .2s',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        {children(xDelta)}
      </div>
    );
  }
}

@withGesture
class PeakComponent extends Component {
  static defaultProps = {
    threshold: 150,
    onNext: () => null,
    onPrevious: () => null,
  };

  state = { down: false, revert: false };

  componentWillReceiveProps(nextProps, nextContext) {
    if (
      nextProps.down === false &&
      this.state.down === true &&
      this.props.index !== nextProps.index
    ) {
      this.setState({ down: false, revert: false });
    }

    if (this.props.down && nextProps.down === false) {
      // @todo add length check here to revert when you reach the end.
      if (nextProps.xDelta >= nextProps.threshold) {
        nextProps.onPrevious();
      } else if (nextProps.xDelta <= -nextProps.threshold) {
        nextProps.onNext();
      } else {
        this.setState({ down: false, revert: true });
      }
    }
    if (this.state.down === false && nextProps.down === true) {
      this.setState({ down: true });
    }
  }

  render() {
    const { down, revert } = this.state;
    const {
      customOffset,
      xDelta,
      index,
      renderLeft,
      renderRight,
      children,
    } = this.props;
    const x = (down ? xDelta : 0) + customOffset;
    const shouldAnimate = revert && down === false;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: '#000',
          color: '#fff',
          zIndex: 9999999,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1, position: 'relative', height: '100%' }}>
          <FlipMove typeName={null} enterAnimation="none" leaveAnimation="none">
            <div
              key={index - 1}
              style={{
                position: 'absolute',
                height: 600,
                width: '100%',
                top: 0,
                left: `calc(-100% + ${x}px)`,
                transition: shouldAnimate ? 'left .2s' : null,
              }}
            >
              {renderLeft()}
            </div>
            <div
              key={index}
              style={{
                position: 'absolute',
                height: 600,
                width: '100%',
                left: `calc(0px + ${x}px)`,
                top: 0,
                transition: shouldAnimate ? 'left .2s' : null,
              }}
            >
              {children}
            </div>
            <div
              key={index + 1}
              style={{
                position: 'absolute',
                height: 600,
                width: '100%',
                left: `calc(100% + ${x}px)`,
                top: 0,
                transition: shouldAnimate ? 'left .2s' : null,
              }}
            >
              {renderRight()}
            </div>
          </FlipMove>
        </div>
      </div>
    );
  }
}

const ConnectedFSMPV = withGesture(FullScreenMobilePageView);

class MobileViewer extends Component {
  state = { open: false };
  render() {
    const { open } = this.state;
    const { ...props } = this.props;
    return (
      <div>
        <div onClick={() => this.setState(s => ({ open: !s.open }))}>
          <StaticImageViewport {...props} />
        </div>
        {open ? <div>TESTING CONTENT</div> : null}
      </div>
    );
  }
}

class MobilePageView extends Component {
  state = { isFullscreen: true, currentCanvas: null, __mount: false };

  componentWillMount() {
    setInterval(() => {
      this.setState(s => ({ __mount: !s.__mount }));
    }, 1000);
  }

  render() {
    const { isFullscreen, __mount } = this.state;
    const { bem, manifest } = this.props;

    if (isFullscreen) {
      const {
        canvas,
        currentIndex,
        region,
        fullscreenProps,
        previousRange,
        nextRange,
      } = this.props;

      const next = manifest
        .getSequenceByIndex(0)
        .getCanvasByIndex(currentIndex + 1);

      const prev = manifest
        .getSequenceByIndex(0)
        .getCanvasByIndex(currentIndex - 1);

      return (
        <PeakComponent
          customOffset={0}
          onNext={nextRange}
          onPrevious={previousRange}
          renderLeft={() =>
            prev ? (
              <MobileViewer
                manifest={manifest}
                canvas={prev}
                maxHeight={200}
                maxWidth={200}
              />
            ) : null
          }
          renderRight={() =>
            next ? (
              <MobileViewer
                manifest={manifest}
                canvas={next}
                maxHeight={200}
                maxWidth={200}
              />
            ) : null
          }
          index={currentIndex}
        >
          <MobileViewer
            manifest={manifest}
            canvas={canvas}
            maxHeight={200}
            maxWidth={200}
          />
        </PeakComponent>
      );

      return (
        <div
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: '#000',
            color: '#fff',
            zIndex: 9999999,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                height: 600,
                width: '100%',
                background: 'blue',
                opacity: 0.5,
                transform: `translateX(calc(100% + ${
                  __mount ? '0px' : '-100%'
                }))`,
                transition: 'transform .3s',
              }}
            />
            <div
              style={{
                position: 'absolute',
                height: 600,
                width: '100%',
                opacity: 0.5,
                background: 'green',
                transform: `translateX(calc(0% + ${
                  __mount ? '0px' : '-100%'
                }))`,
                transition: 'transform .3s',
              }}
            />
            <div
              style={{
                position: 'absolute',
                height: 600,
                width: '100%',
                opacity: 0.5,
                background: 'red',
                transform: `translateX(calc(-100% + ${
                  __mount ? '0px' : '-100%'
                }))`,
                transition: 'transform .3s',
              }}
            />
          </div>
        </div>
      );
    }

    if (isFullscreen) {
      const {
        canvas,
        currentIndex,
        region,
        fullscreenProps,
        previousRange,
        nextRange,
      } = this.props;

      const next = manifest
        .getSequenceByIndex(0)
        .getCanvasByIndex(currentIndex + 1);

      const prev = manifest
        .getSequenceByIndex(0)
        .getCanvasByIndex(currentIndex - 1);

      const flexStyle = {
        flexGrow: 0,
        flexShrink: 0,
        width: '50%',
        display: 'block',
        background: 'red',
        transition: 'transform .3s',
      };

      return (
        <div
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: '#000',
            color: '#fff',
            zIndex: 9999999,
            width: '200%',
            transform: 'translateX(-50%)',
          }}
        >
          <CanvasDetail canvas={canvas}>
            {({ label, body, attributionLabel, attribution }) => (
              <ConnectedFSMPV onNext={nextRange} onPrevious={previousRange}>
                {xDelta => (
                  <FlipMove typeName={null}>
                    {prev ? (
                      <div
                        key={currentIndex - 1}
                        data-key={currentIndex - 1}
                        style={{
                          ...flexStyle,
                          transform: `translateX(${xDelta}px)`,
                        }}
                      >
                        <StaticImageViewport
                          manifest={manifest}
                          canvas={prev}
                          maxHeight={200}
                          maxWidth={200}
                        />
                      </div>
                    ) : (
                      <div
                        key={currentIndex - 1}
                        data-key={currentIndex - 1}
                        style={{
                          ...flexStyle,
                          transform: `translateX(${xDelta}px)`,
                        }}
                      />
                    )}
                    <div
                      key={currentIndex}
                      data-key={currentIndex}
                      style={{
                        ...flexStyle,
                        transform: `translateX(${xDelta}px)`,
                      }}
                    >
                      <StaticImageViewport
                        className={bem.element('canvas-image')}
                        manifest={manifest}
                        canvas={canvas}
                        maxHeight={200}
                        maxWidth={200}
                      >
                        <div className={bem.element('attribution')}>
                          {attributionLabel} {attribution}
                        </div>
                      </StaticImageViewport>
                    </div>
                    {next ? (
                      <div
                        key={currentIndex + 1}
                        data-key={currentIndex + 1}
                        style={{
                          ...flexStyle,
                          transform: `translateX(${xDelta}px)`,
                        }}
                      >
                        <StaticImageViewport
                          manifest={manifest}
                          canvas={next}
                          maxHeight={200}
                          maxWidth={200}
                        />
                      </div>
                    ) : (
                      <div
                        key={currentIndex + 1}
                        data-key={currentIndex + 1}
                        style={{
                          ...flexStyle,
                          transform: `translateX(${xDelta}px)`,
                        }}
                      />
                    )}
                  </FlipMove>
                )}
              </ConnectedFSMPV>
            )}
          </CanvasDetail>
        </div>
      );
    }

    return (
      <div className={bem}>
        {manifest
          .getSequenceByIndex(0)
          .getCanvases()
          .map(canvas => (
            <CanvasDetail key={canvas.id} canvas={canvas}>
              {({ label, body, attributionLabel, attribution }) => (
                <div className={bem.element('canvas')}>
                  <StaticImageViewport
                    className={bem.element('canvas-image')}
                    manifest={manifest}
                    canvas={canvas}
                    maxHeight={200}
                    maxWidth={200}
                  >
                    <div className={bem.element('attribution')}>
                      {attributionLabel} {attribution}
                    </div>
                  </StaticImageViewport>
                  <div className={bem.element('metadata')}>
                    <div className={bem.element('detail')}>
                      <h3 className={bem.element('detail-label')}>{label}</h3>
                      <p className={bem.element('detail-body')}>{body}</p>
                    </div>
                  </div>
                </div>
              )}
            </CanvasDetail>
          ))}
      </div>
    );
  }
}

export default withBemClass('mobile-page-view')(MobilePageView);
