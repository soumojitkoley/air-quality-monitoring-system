let airQualityValue = { value: 0, timestamp: Date.now() };

exports.handler = async (event, context) => {
  if (event.httpMethod === 'POST') {
    const { airQuality } = JSON.parse(event.body);
    airQualityValue = { value: airQuality, timestamp: Date.now() };
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Air quality updated successfully' }),
    };
  } else if (event.httpMethod === 'GET') {
    if (Date.now() - airQualityValue.timestamp > 15000) {
      airQualityValue = { value: 0, timestamp: Date.now() };
    }
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ airQuality: airQualityValue.value }),
    };
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not Found' }),
    };
  }
};