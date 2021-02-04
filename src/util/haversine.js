module.exports = (models, lat, lng) => {
  return [[models.sequelize.literal("6371 * acos(cos(radians("+lat+")) * cos(radians(lat)) * cos(radians("+lng+") - radians(lng)) + sin(radians("+lat+")) * sin(radians(lat)))"), 'distance']];
};
