import React, { Component } from 'react';
import {
  withBemClass,
  StaticImageViewport,
  FullPageViewport,
} from '@canvas-panel/core';
import CanvasDetail from '../CanvasDetail/CanvasDetail';
import './MobilePageView.scss';
import FlipMove from 'react-flip-move';
import OpenSeadragonViewport from '@canvas-panel/core/src/viewers/OpenSeadragonViewport/OpenSeadragonViewport';
import SingleTileSource from '@canvas-panel/core/src/components/SingleTileSource/SingleTileSource';

class PeakComponent extends Component {
  static defaultProps = {
    threshold: 50,
    customOffset: 0,
    lastOffset: 0,
    onNext: () => null,
    onPrevious: () => null,
  };

  state = { down: false, revert: false, lastOffset: 0, isTransitioning: false };

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.props.down && nextProps.down === false) {
      if (
        this.props.customOffset >= nextProps.threshold &&
        this.props.index !== 0
      ) {
        nextProps.onPrevious();
      } else if (
        this.props.customOffset <= -nextProps.threshold &&
        this.props.index + 1 < this.props.size
      ) {
        nextProps.onNext();
      }
    }
  }

  render() {
    const {
      down,
      customOffset,
      index,
      renderLeft,
      renderRight,
      children,
    } = this.props;
    const x = customOffset;
    const shouldAnimate = down === false;

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
          <FlipMove
            typeName={null}
            enterAnimation="none"
            leaveAnimation="none"
            duration={300}
          >
            <div
              key={index - 1}
              style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
                top: 0,
                left: `calc(-100% + ${x - 20}px)`,
                transition: shouldAnimate ? 'left .3s' : null,
              }}
            >
              {renderLeft()}
            </div>
            <div
              key={index}
              style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
                left: !down ? `calc(0px + ${x}px)` : null,
                top: 0,
              }}
            >
              {children}
            </div>
            <div
              key={index + 1}
              style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
                left: `calc(100% + ${x + 20}px)`,
                transition: shouldAnimate ? 'left .3s' : null,
                top: 0,
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

class MobileViewer extends Component {
  static defaultProps = {
    applyOffset: () => null,
    setViewport: () => null,
  };

  state = { open: false, constrained: false };

  onConstrain = (viewer, x, y) => {
    if (this.props.applyOffset) {
      this.props.applyOffset(-x);
    }
    this.setState({ constrained: true });
    if (y) {
      this.applyConstraints(viewer, true);
    }
  };

  applyConstraints(viewer, immediately) {
    const bounds = viewer.viewport.getBoundsNoRotate();
    const constrainedBounds = viewer.viewport._applyBoundaryConstraints(bounds);

    constrainedBounds.x = bounds.x;
    if (bounds.y !== constrainedBounds.y) {
      viewer.viewport.fitBounds(constrainedBounds, immediately);
    }
  }

  onDragStart = viewer => {
    if (this.props.onDragStart) {
      this.props.onDragStart();
    }
  };
  onDragStop = viewer => {
    if (this.props.onDragStop) {
      this.props.onDragStop();
    }

    if (this.props.applyOffset) {
      this.props.applyOffset(0);
    }
    this.setState({ constrained: false });
  };

  render() {
    const { open, constrained } = this.state;
    const { displayStatic, onDragStart, onDragStop, ...props } = this.props;
    return (
      <div style={{ height: '100%' }}>
        <div
          style={{ height: '100%' }}
          onClick={() => this.setState(s => ({ open: !s.open }))}
        >
          {displayStatic ? (
            <StaticImageViewport {...props} />
          ) : (
            <SingleTileSource {...props}>
              <FullPageViewport
                setRef={this.props.setViewport}
                position="absolute"
                interactive={true}
                style={{ height: '100%' }}
                osdOptions={{
                  visibilityRatio: 1,
                  constrainDuringPan: false,
                  showNavigator: false,
                  animationTime: 0.3,
                }}
                onConstrain={this.onConstrain}
              >
                <OpenSeadragonViewport
                  useMaxDimensions={true}
                  interactive={true}
                  onDragStart={this.onDragStart}
                  onDragStop={this.onDragStop}
                  osdOptions={this.osdOptions}
                />
              </FullPageViewport>
            </SingleTileSource>
          )}
        </div>
        {open ? <div>TESTING CONTENT</div> : null}
      </div>
    );
  }
}

class MobilePageView extends Component {
  state = {
    isFullscreen: true,
    currentCanvas: null,
    __mount: false,
    offset: 0,
    down: false,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentIndex !== this.props.currentIndex) {
      this.setState({ offset: 0 });
    }
  }

  onDragStart = () => {
    this.setState({ down: true });
  };
  onDragStop = func => {
    this.setState({ down: false });
  };

  nextRange = () => {
    this.viewport.viewer.viewer.viewport.applyConstraints(true);
    this.props.nextRange();
  };

  previousRange = () => {
    this.viewport.viewer.viewer.viewport.applyConstraints(true);
    this.props.previousRange();
  };

  setViewport = viewport => {
    this.viewport = viewport;
  };

  applyOffset = offset => {
    // if (offset === 0) {
    //   this.currentViewer.viewport.centerSpringX.animationTime = 0.3;
    //   this.currentViewer.viewport.centerSpringY.animationTime = 0.3;
    //   this.currentViewer.viewport.zoomSpring.animationTime = 0.3;
    // } else {
    //   this.currentViewer.viewport.centerSpringX.animationTime = 0;
    //   this.currentViewer.viewport.centerSpringY.animationTime = 0;
    //   this.currentViewer.viewport.zoomSpring.animationTime = 0;
    // }
    this.setState({ offset });
  };

  render() {
    const { isFullscreen, __mount, offset, down } = this.state;
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

      const size = manifest.getSequenceByIndex(0).getCanvases().length;

      const next = manifest
        .getSequenceByIndex(0)
        .getCanvasByIndex(currentIndex + 1);

      const prev = manifest
        .getSequenceByIndex(0)
        .getCanvasByIndex(currentIndex - 1);

      return (
        <PeakComponent
          down={down}
          customOffset={offset}
          onNext={this.nextRange}
          onPrevious={this.previousRange}
          size={size}
          renderLeft={() =>
            prev ? <MobileViewer manifest={manifest} canvas={prev} /> : null
          }
          renderRight={() =>
            next ? <MobileViewer manifest={manifest} canvas={next} /> : null
          }
          index={currentIndex}
        >
          <MobileViewer
            setViewport={this.setViewport}
            manifest={manifest}
            canvas={canvas}
            onDragStart={this.onDragStart}
            onDragStop={this.onDragStop}
            applyOffset={this.applyOffset}
          />
        </PeakComponent>
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
