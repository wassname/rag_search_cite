async function bingWebSearch(query) {
  const SUBSCRIPTION_KEY = window.localStorage.getItem('BING_SEARCH_KEY');
  const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      method: 'GET', // HTTP method
      headers: {
        'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('\nJSON Response:\n');
    console.dir(data, { colors: false, depth: null });

    // Process headers
    response.headers.forEach((value, name) => {
      if (name.startsWith("bingapis-") || name.startsWith("x-msedge-")) {
        console.log(`${name}: ${value}`);
      }
    });

    let docs = data.webPages.value.map((wp, index) => {
      return { name:wp.name, url:wp.url, content: wp.snippet, query, source: 'bing' }
    })
    return docs
  } catch (e) {
    console.log('Error: ' + e.message);
  }
}

export default bingWebSearch;
