const ua = navigator.userAgent.toLowerCase().replace(/^mozilla\/\d\.\d\W/, "");

const mobiles = {
		"iphone": /iphone/,
		"ipad": /ipad|macintosh/,
		"android": /android/
	},
	desktops = {
		"windows": /win/,
		"mac": /macintosh/,
		"linux": /linux/
	};

const os = Object.keys(mobiles).find(os => mobiles[os].test(ua) && navigator.maxTouchPoints >= 1)
||
Object.keys(desktops).find(os => desktops[os].test(ua));

const browserTest = ua.match(/(\w+)\/(\d+\.\d+(?:\.\d+)?(?:\.\d+)?)/g),
	browserOffset = browserTest.length && (browserTest.length > 2 && !(/^(ver|cri|gec)/.test(browserTest[1])) ? 1 : 0),
	browserResult = browserTest.length && browserTest[browserTest.length - 1 - browserOffset].split("/"),
	browser = browserResult && browserResult[0],
	version = browserResult && browserResult[1];

//
//
// const browserVersion = (userAgent,regex) => {
// 	return userAgent.match(regex) ? userAgent.match(regex)[2] : null;
// }
// const browser = (() => {
// 	const userAgent = navigator.userAgent;
// 	let browser = "unkown";
// 	// Detect browser name
// 	browser = (/ucbrowser/i).test(userAgent) ? 'UCBrowser' : browser;
// 	browser = (/edg/i).test(userAgent) ? 'Edge' : browser;
// 	browser = (/googlebot/i).test(userAgent) ? 'GoogleBot' : browser;
// 	browser = (/chromium/i).test(userAgent) ? 'Chromium' : browser;
// 	browser = (/firefox|fxios/i).test(userAgent) && !(/seamonkey/i).test(userAgent) ? 'Firefox' : browser;
// 	browser = (/; msie|trident/i).test(userAgent) && !(/ucbrowser/i).test(userAgent) ? 'IE' : browser;
// 	browser = (/chrome|crios/i).test(userAgent) && !(/opr|opera|chromium|edg|ucbrowser|googlebot/i).test(userAgent) ? 'Chrome' : browser;;
// 	browser = (/safari/i).test(userAgent) && !(/chromium|edg|ucbrowser|chrome|crios|opr|opera|fxios|firefox/i).test(userAgent) ? 'Safari' : browser;
// 	browser = (/opr|opera/i).test(userAgent) ? 'Opera' : browser;
// 	return browser
// })()
//
// const version = ((browser => {
// 	switch (browser) {
// 		case 'UCBrowser': return browserVersion(userAgent,/(ucbrowser)\/([\d\.]+)/i);
// 		case 'Edge': return browserVersion(userAgent,/(edge|edga|edgios|edg)\/([\d\.]+)/i);
// 		case 'GoogleBot': return browserVersion(userAgent,/(googlebot)\/([\d\.]+)/i);
// 		case 'Chromium': return browserVersion(userAgent,/(chromium)\/([\d\.]+)/i);
// 		case 'Firefox': return browserVersion(userAgent,/(firefox|fxios)\/([\d\.]+)/i);
// 		case 'Chrome': return browserVersion(userAgent,/(chrome|crios)\/([\d\.]+)/i);
// 		case 'Safari': return browserVersion(userAgent,/(safari)\/([\d\.]+)/i);
// 		case 'Opera': return browserVersion(userAgent,/(opera|opr)\/([\d\.]+)/i);
// 		case 'IE': const version = browserVersion(userAgent,/(trident)\/([\d\.]+)/i);
// 		// IE version is mapped using trident version
// 		// IE/8.0 = Trident/4.0, IE/9.0 = Trident/5.0
// 		return version ? parseFloat(version) + 4.0 : `7.0`;
// 		default: return `0.0.0.0`;
// 	}
// }))(browser)

module.exports = {
	browser,
	version,
	os,
}
