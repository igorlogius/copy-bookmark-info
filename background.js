
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

	// 1. get the format string from storage
	let tmp = await getActivPlaceholderStr();

	// 2. replace placeholders
	const replacers = [
		,"title"
	    ,"url"
	];

	for (const p of replacers) {
        tmp = tmp.replaceAll("%"+p, (typeof bookmark[p] !== 'undefined'? bookmark[p] : "n/a"));
    }
    tmp = tmp + "\n";

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
        if(info.bookmarkId ) {
            try {
                const tmp = (await browser.bookmarks.get(info.bookmarkId))[0];
                if(tmp.url){
                    bookmark2clip(tmp);
                }
            }catch(e){
                console.error(e);
            }
        }
    }
});

