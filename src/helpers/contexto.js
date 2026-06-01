'use strict';

module.exports = function construirQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([Key, value]) => {
    if (
      value !== undefined && value !== null && value !== ""
    ) {
      query.append(Key, value);
    }
  });
  return query.toString();
};