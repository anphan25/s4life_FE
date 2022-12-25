import * as React from 'react';
import { useState, useEffect } from 'react';
import MapGL, { Marker, FlyToInterpolator } from '@goongmaps/goong-map-react';

import Pin from './Pin';

const GoongMap = ({ locationDetail }) => {
  const [viewport, setViewport] = useState({
    latitude: locationDetail?.latitude || 10.756407,
    longitude: locationDetail?.longitude || 106.6636929,
    zoom: 14,
    bearing: 0,
    pitch: 0,
    transitionDuration: 1000,
    transitionInterpolator: new FlyToInterpolator(),
  });
  const [marker, setMarker] = useState({
    latitude: locationDetail?.latitude || 10.756407,
    longitude: locationDetail?.longitude || 106.6636929,
  });

  const handleViewAndMarker = () => {
    if (!locationDetail) {
      return;
    }
    setMarker({
      latitude: locationDetail?.latitude,
      longitude: locationDetail?.longitude,
    });

    setViewport((pre) => ({ ...pre, latitude: locationDetail?.latitude, longitude: locationDetail?.longitude }));
  };

  const handleViewportChange = (viewport) => {
    setViewport(viewport);
  };

  useEffect(() => {
    handleViewAndMarker();
  }, [locationDetail]);

  return (
    <>
      <MapGL
        {...viewport}
        width="100%"
        height="100%"
        mapStyle="https://tiles.goong.io/assets/goong_map_web.json"
        onViewportChange={handleViewportChange}
        goongApiAccessToken={process.env.REACT_APP_GOONG_MAPTILES_ACCESS_KEY}
      >
        <Marker {...marker}>
          <Pin size={20} />
        </Marker>
      </MapGL>
    </>
  );
};

export default React.memo(GoongMap);
