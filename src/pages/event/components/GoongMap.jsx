import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import MapGL, { Marker, FlyToInterpolator } from '@goongmaps/goong-map-react';
import Pin from './Pin';

const DEFAULT_LATITUDE = 10.756407;
const DEFAULT_LONGITUDE = 106.6636929;

const GoongMap = ({ locationDetail }) => {
  const latitudeNumber = locationDetail?.latitude * 1 || null;
  const longitudeNumber = locationDetail?.longitude * 1 || null;

  const [viewport, setViewport] = useState({
    latitude: latitudeNumber || DEFAULT_LATITUDE,
    longitude: longitudeNumber || DEFAULT_LONGITUDE,
    zoom: 14,
    bearing: 0,
    pitch: 0,
    transitionDuration: 1000,
    transitionInterpolator: new FlyToInterpolator(),
  });
  const [marker, setMarker] = useState({
    latitude: latitudeNumber || DEFAULT_LATITUDE,
    longitude: longitudeNumber || DEFAULT_LONGITUDE,
  });

  const handleViewAndMarker = () => {
    if (!locationDetail) {
      return;
    }
    setMarker({
      latitude: latitudeNumber || DEFAULT_LATITUDE,
      longitude: longitudeNumber || DEFAULT_LONGITUDE,
    });

    setViewport((pre) => ({
      ...pre,
      latitude: latitudeNumber || DEFAULT_LATITUDE,
      longitude: longitudeNumber || DEFAULT_LONGITUDE,
    }));
  };

  const handleViewportChange = (viewport) => {
    setViewport(viewport);
  };

  const onMarkerDragEnd = useCallback((event) => {
    setMarker({
      longitude: event.lngLat[0],
      latitude: event.lngLat[1],
    });
  }, []);

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
        <Marker {...marker} draggable onDragEnd={onMarkerDragEnd}>
          <Pin size={20} />
        </Marker>
      </MapGL>
    </>
  );
};

export default React.memo(GoongMap);
