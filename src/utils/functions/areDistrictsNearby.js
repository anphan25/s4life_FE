import { nearByDistrict } from 'utils';

export const areDistrictsNearby = (selectedDistricts) => {
  const specificDistricts = nearByDistrict.filter((district) => selectedDistricts.includes(district.id));

  const checkedArray = specificDistricts.filter((district) =>
    selectedDistricts.every((id) => [district.id, ...district.nearBy].includes(id))
  );

  return checkedArray?.length > 0;
};
