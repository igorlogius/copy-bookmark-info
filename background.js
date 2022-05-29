
const manifest = browser.runtime.getManifest();
const extname = manifest.name;


async function getActivPlaceholderStr() {
    try {
	const store = await browser.storage.local.get('placeholder_urls');
	for(const val of store.placeholder_urls) {
		if(typeof val.activ === 'boolean' && val.activ === true){
			return val.name;
		}
	}
}catch(e) {
    console.error(e);
}
	return 'Plaintext: %title - %url';
}


async function bookmark2clip(bookmark) {
    console.log('bookmark2clip');

	// 1. get the format string from storage
	let tmp = await getActivPlaceholderStr();

    console.log('placeholder: ', tmp);

	// 2. replace placeholders
	const replacers = [
		,"title"
	    ,"url"
	];

	//let out = "";

	//let tmp2 = "";

    /*
	for(const tab of tabs) {
		tmp2 = tmp;
    */
	for (const p of replacers) {
        tmp = tmp.replaceAll("%"+p, (typeof bookmark[p] !== 'undefined'? bookmark[p] : "n/a"));
    }
    tmp = tmp + "\n";

	//	out = out + tmp2 + '\n';
	//}

    browser.notifications.create(extname + (new Date()).toString(), {
		"type": "basic",
		"title": extname,
		//"iconUrl": browser.runtime.getURL("icon.png"),
		"message":  'copied bookmark information to clipboard'
	});

	// 3. copy text to clipboard
	navigator.clipboard.writeText(tmp);


}

const menuid1 = "Copy Custom Format";
browser.menus.create({
    id: menuid1,
    title: menuid1,
    contexts: ["bookmark"],
    onclick: async function(info, tab) {
        console.log('clicked', info.bookmarkId);
        if(info.bookmarkId ) {

            try {
                const tmp = (await browser.bookmarks.get(info.bookmarkId))[0];
                console.log('clicked', tmp.url);
                if(tmp.url){
                    bookmark2clip(tmp);
                }
            }catch(e){
                console.error(e);
            }
        }
    }
});

