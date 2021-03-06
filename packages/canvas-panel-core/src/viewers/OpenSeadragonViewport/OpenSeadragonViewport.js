import React, { Component } from 'react';
import OpenSeadragon from 'openseadragon';
import OpenSeadragonViewer from '../OpenSeadragonViewer/OpenSeadragonViewer';
import functionOrMapChildren from '../../utility/functionOrMapChildren';

class OpenSeadragonViewport extends Component {
  state = {
    scale: 1,
  };

  static defaultProps = {
    viewportController: true,
  };

  componentDidMount() {
    if (this.viewer) {
      this.bindEvents(this.viewer);
    }
  }

  unmounted = false;

  componentWillUnmount() {
    this.unmounted = true;
  }

  bindEvents(viewer) {
    viewer.addHandler('update-viewport', () => this.resize(viewer));
    viewer.addHandler('open', () => this.resize(viewer));
    this.resize(viewer);
  }

  resize(viewer) {
    const { canvas } = this.props;
    const firstImage = viewer.world.getItemAt(0);
    if (!firstImage) {
      return;
    }
    const imgWidth = canvas.getWidth();
    const imgHeight = canvas.getHeight();
    const imgAspectRatio = imgWidth / imgHeight;
    const boundsRect = viewer.viewport.getBounds(true);
    const viewportOrigin = new OpenSeadragon.Point(
      boundsRect.x,
      boundsRect.y * imgAspectRatio
    );

    const viewportWidth = boundsRect.width;
    const viewportHeight = boundsRect.height * imgAspectRatio;

    // Redraw
    const viewportZoom = viewer.viewport.getZoom(true);
    const zoom = firstImage.viewportToImageZoom(viewportZoom);
    const imageRatio =
      (firstImage._scaleSpring.current.value *
        firstImage.viewport._containerInnerSize.x) /
      firstImage.source.dimensions.x;

    const isZoomedOut =
      viewportZoom.toFixed(2) <= viewer.viewport.getMinZoom().toFixed(2);

    const rotation = viewer.viewport.getRotation();

    const x =
      ((viewportOrigin.x / imgWidth - viewportOrigin.x) / viewportWidth) *
      viewer.container.clientWidth;
    const y =
      ((viewportOrigin.y / imgHeight - viewportOrigin.y) / viewportHeight) *
      viewer.container.clientHeight;

    if (this.viewer && this.unmounted === false) {
      // Set position for parents.
      if (this.props.getPosition) {
        this.props.getPosition({
          x,
          y,
          zoom,
          scale: this.state.scale,
          rotation,
          imageRatio,
          isZoomedOut,
        });
      }

      // Set state for transform.
      this.setState(() => ({
        canvasScale: this.state.scale * zoom,
      }));
    }
  }

  setViewer = viewer => {
    const { onImageLoaded } = this.props;
    this.viewer = viewer;
    if (onImageLoaded) {
      onImageLoaded(viewer);
    }
    this.bindEvents(viewer);
  };

  render() {
    const { canvasScale } = this.state;
    const { children, ...props } = this.props;

    if (!children) {
      return (
        <OpenSeadragonViewer
          {...props}
          canvasScale={canvasScale}
          onImageLoaded={this.setViewer}
        />
      );
    }

    return functionOrMapChildren(children, {
      canvasScale: canvasScale,
      onImageLoaded: this.setViewer,
      ...props,
    });
  }
}

export default OpenSeadragonViewport;
