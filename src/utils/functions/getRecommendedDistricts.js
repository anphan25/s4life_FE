import { nearByDistrict } from 'utils';

export const getRecommendedDistricts = (registrationAreaIds) => {
  const specificDistricts = nearByDistrict.filter((district) => registrationAreaIds.includes(district.id));

  const recommendedDistrictNameArray = specificDistricts
    .filter((district) => registrationAreaIds.some((id) => district.nearBy?.includes(id)))
    .map((district) => [district?.id, ...district?.nearBy])
    .map((districtsIds) =>
      districtsIds
        .filter((id) => registrationAreaIds.includes(id))
        .map((filteredId) => {
          return nearByDistrict.find((district) => district?.id === filteredId)?.name;
        })
    );
  return recommendedDistrictNameArray;
};
