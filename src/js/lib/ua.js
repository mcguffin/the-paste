const getBrowser = (withVersion = false) => {
	const userAgent = navigator.userAgent;
	let browser = "unkown";
	// Detect browser name
	browser = (/ucbrowser/i).test(userAgent) ? 'UCBrowser' : browser;
	browser = (/edg/i).test(userAgent) ? 'Edge' : browser;
	browser = (/googlebot/i).test(userAgent) ? 'GoogleBot' : browser;
	browser = (/chromium/i).test(userAgent) ? 'Chromium' : browser;
	browser = (/firefox|fxios/i).test(userAgent) && !(/seamonkey/i).test(userAgent) ? 'Firefox' : browser;
	browser = (/; msie|trident/i).test(userAgent) && !(/ucbrowser/i).test(userAgent) ? 'IE' : browser;
	browser = (/chrome|crios/i).test(userAgent) && !(/opr|opera|chromium|edg|ucbrowser|googlebot/i).test(userAgent) ? 'Chrome' : browser;;
	browser = (/safari/i).test(userAgent) && !(/chromium|edg|ucbrowser|chrome|crios|opr|opera|fxios|firefox/i).test(userAgent) ? 'Safari' : browser;
	browser = (/opr|opera/i).test(userAgent) ? 'Opera' : browser;

	if ( ! withVersion ) {
		return browser
	}

	// detect browser version
	switch (browser) {
		case 'UCBrowser': return `${browser}/${browserVersion(userAgent,/(ucbrowser)\/([\d\.]+)/i)}`;
		case 'Edge': return `${browser}/${browserVersion(userAgent,/(edge|edga|edgios|edg)\/([\d\.]+)/i)}`;
		case 'GoogleBot': return `${browser}/${browserVersion(userAgent,/(googlebot)\/([\d\.]+)/i)}`;
		case 'Chromium': return `${browser}/${browserVersion(userAgent,/(chromium)\/([\d\.]+)/i)}`;
		case 'Firefox': return `${browser}/${browserVersion(userAgent,/(firefox|fxios)\/([\d\.]+)/i)}`;
		case 'Chrome': return `${browser}/${browserVersion(userAgent,/(chrome|crios)\/([\d\.]+)/i)}`;
		case 'Safari': return `${browser}/${browserVersion(userAgent,/(safari)\/([\d\.]+)/i)}`;
		case 'Opera': return `${browser}/${browserVersion(userAgent,/(opera|opr)\/([\d\.]+)/i)}`;
		case 'IE': const version = browserVersion(userAgent,/(trident)\/([\d\.]+)/i);
		// IE version is mapped using trident version
		// IE/8.0 = Trident/4.0, IE/9.0 = Trident/5.0
		return version ? `${browser}/${parseFloat(version) + 4.0}` : `${browser}/7.0`;
		default: return `unknown/0.0.0.0`;
	}
}

const browserVersion = (userAgent,regex) => {
	return userAgent.match(regex) ? userAgent.match(regex)[2] : null;
}
module.exports = getBrowser
