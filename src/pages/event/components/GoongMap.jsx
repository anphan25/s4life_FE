import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { getLocationByLatLong } from 'api';
import MapGL, { Marker, FlyToInterpolator } from '@goongmaps/goong-map-react';
import { v4 as uuidv4 } from 'uuid';
import Pin from './Pin';

const DEFAULT_LATITUDE = 10.756407;
const DEFAULT_LONGITUDE = 106.6636929;

const GoongMap = ({ locationDetail, onDrag }) => {
  const latitudeNumber = locationDetail?.latitude * 1 || null;
  const longitudeNumber = locationDetail?.longitude * 1 || null;

  const [viewport, setViewport] = useState({
    latitude: latitudeNumber || DEFAULT_LATITUDE,
    longitude: longitudeNumber || DEFAULT_LONGITUDE,
    zoom: 16,
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

  const onMarkerDragEnd = useCallback(async (event) => {
    setMarker({
      longitude: event.lngLat[0],
      latitude: event.lngLat[1],
    });

    const sessionToken = uuidv4();

    const response = await getLocationByLatLong(event.lngLat[1], event.lngLat[0], sessionToken);

    const mappingResult = response?.data?.results?.map((result) => ({
      name: result.name,
      address: result.formatted_address,
      placeId: result.placeId,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    }));

    if (!onDrag) return;

    onDrag(mappingResult);
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
