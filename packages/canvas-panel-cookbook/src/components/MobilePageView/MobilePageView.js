import React, { Component } from 'react';
import { withBemClass, StaticImageViewport } from '@canvas-panel/core';
import CanvasDetail from '../CanvasDetail/CanvasDetail';
import './MobilePageView.scss';
import SlideShow from '../Slideshow/SlideShow';
import Slide from '../Slide/Slide';
import { Gesture, withGesture } from 'react-with-gesture';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import posed, { PoseGroup } from 'react-pose';
import Carousel from 'nuka-carousel';
import FlipMove from 'react-flip-move';

const PosedImage = props => <div {...props} />;
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
          transform: down
            ? `translate(${xDelta}px, ${0}px)`
            : `translate(0px, 0px)`,
          transition: down ? null : 'transform .2s',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        {children}
      </div>
    );
  }
}

const ConnectedFSMPV = withGesture(FullScreenMobilePageView);

class MobilePageView extends Component {
  state = { isFullscreen: true, currentCanvas: null };

  render() {
    const { isFullscreen } = this.state;
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

      const flexStyle = {
        flexGrow: 0,
        flexShrink: 0,
        width: '50%',
        display: 'block',
        background: 'red',
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
                <FlipMove typeName={null}>
                  {prev ? (
                    <PosedImage
                      key={currentIndex - 1}
                      data-key={currentIndex - 1}
                      style={flexStyle}
                    >
                      <StaticImageViewport
                        manifest={manifest}
                        canvas={prev}
                        maxHeight={200}
                        maxWidth={200}
                      />
                    </PosedImage>
                  ) : (
                    <PosedImage
                      key={currentIndex - 1}
                      data-key={currentIndex - 1}
                      style={flexStyle}
                    />
                  )}
                  <PosedImage
                    key={currentIndex}
                    data-key={currentIndex}
                    style={flexStyle}
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
                  </PosedImage>
                  {next ? (
                    <PosedImage
                      key={currentIndex + 1}
                      data-key={currentIndex + 1}
                      style={flexStyle}
                    >
                      <StaticImageViewport
                        manifest={manifest}
                        canvas={next}
                        maxHeight={200}
                        maxWidth={200}
                      />
                    </PosedImage>
                  ) : (
                    <PosedImage
                      key={currentIndex + 1}
                      data-key={currentIndex + 1}
                      style={flexStyle}
                    />
                  )}
                </FlipMove>
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
