import React, { Component } from 'react';
import {
  Manifest,
  Fullscreen,
  RangeNavigationProvider,
  withBemClass,
  Responsive,
} from '../../../../canvas-panel-core/es/index';
import FullscreenButton from '../FullscreenButton/FullscreenButton';
import MobilePageView from '../MobilePageView/MobilePageView';
import SimpleSlideTransition from '../SimpleSlideTransition/SimpleSlideTransition';
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator';
import Slide from '../Slide/Slide';
import CanvasNavigation from '../CanvasNavigation/CanvasNavigation';

import './SlideShow.scss';

class SlideShow extends Component {
  render() {
    const { manifestUri, renderPanel, bem } = this.props;
    return (
      <div
        className={bem.modifiers({
          isMobile: Responsive.md.phone(),
        })}
      >
        <Fullscreen>
          {fullscreenProps => (
            <Manifest url={manifestUri}>
              <RangeNavigationProvider>
                {({
                  manifest,
                  canvas,
                  canvasList,
                  currentIndex,
                  previousRange,
                  nextRange,
                  region,
                }) => {
                  return (
                    <div className={bem.element('inner-frame')}>
                      <Responsive
                        phoneOnly={() => <MobilePageView manifest={manifest} />}
                      >
                        <SimpleSlideTransition id={currentIndex}>
                          <Slide
                            // key={currentIndex}
                            fullscreenProps={fullscreenProps}
                            behaviors={canvas.__jsonld.behavior || []}
                            manifest={manifest}
                            canvas={canvas}
                            region={region}
                            renderPanel={renderPanel}
                          />
                        </SimpleSlideTransition>
                        <CanvasNavigation
                          previousRange={previousRange}
                          nextRange={nextRange}
                          canvasList={canvasList}
                          currentIndex={currentIndex}
                        />
                        <ProgressIndicator
                          currentCanvas={currentIndex}
                          totalCanvases={canvasList.length}
                        />
                      </Responsive>
                    </div>
                  );
                }}
              </RangeNavigationProvider>
            </Manifest>
          )}
        </Fullscreen>
      </div>
    );
  }
}

export default withBemClass('slideshow')(SlideShow);
