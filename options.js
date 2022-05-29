
const temporary = browser.runtime.id.endsWith('@temporary-addon');
const manifest = browser.runtime.getManifest();
const extname = manifest.name;

function deleteRow(rowTr) {
	var mainTableBody = document.getElementById('mainTableBody');
	mainTableBody.removeChild(rowTr);
}

function createTableRow(feed) {
	var mainTableBody = document.getElementById('mainTableBody');
	var tr = mainTableBody.insertRow();

	Object.keys(feed).sort().forEach( (key) => {

		if( key === 'activ'){
			var input = document.createElement('input');
			input.className = key;
			input.placeholder = key;
			input.style.width = '100%';
			input.type='radio';
			input.name="placeholdergroup";
			input.checked= (typeof feed[key] === 'boolean' && feed[key] === true)? true: false;
			input.addEventListener("change", saveOptions);
			tr.insertCell().appendChild(input);

		}else if( key === 'name'){
			var input = document.createElement('input');
			input.className = key;
			input.placeholder = "%title - %url";
			input.style.float = 'right';
			input.style.width = '90%';
			input.style.margin = '3px';
			input.value = feed[key];
			tr.insertCell().appendChild(input);
		}else
			if( key !== 'action'){
				var input = document.createElement('input');
				input.className = key;
				input.placeholder = key;
				input.style.width = '0px';
				input.value = feed[key];
				tr.insertCell().appendChild(input);
			}
	});

	var button;
	if(feed.action === 'save'){
		button = createButton("Create", "saveButton", function() {},  true);
	}else{
		button = createButton("Delete", "deleteButton", function() { deleteRow(tr); }, true );
	}
	tr.insertCell().appendChild(button);
}

function collectConfig() {
	// collect configuration from DOM
	var mainTableBody = document.getElementById('mainTableBody');
	var feeds = [];
	for (var row = 0; row < mainTableBody.rows.length; row++) {
		try {
			var name = mainTableBody.rows[row].querySelector('.name').value;
			try {
			var activ = mainTableBody.rows[row].querySelector('.activ').checked;
			if(name !== '' && name.length > 1) {
				feeds.push({
					'activ': activ,
					'name': name
				});
			}
			}catch(e) {
				console.error(e);
			}
		}catch(e){
			console.error(e);
		}
	}
	return feeds;
}

function createButton(text, id, callback, submit) {
	var span = document.createElement('span');
	var button = document.createElement('button');
	button.id = id;
	button.textContent = text;
	button.className = "browser-style";
	if (submit) {
		button.type = "submit";
	} else {
		button.type = "button";
	}
	button.name = id;
	button.value = id;
	button.addEventListener("click", callback);
	span.appendChild(button);
	return span;
}

async function saveOptions(e) {
	var feeds = collectConfig();
	await browser.storage.local.set({ 'placeholder_urls': feeds });
}

async function restoreOptions() {
	var mainTableBody = document.getElementById('mainTableBody');
	createTableRow({
		'activ': null,
		'name': '' ,
		'action':'save'
	});
	var res = await browser.storage.local.get('placeholder_urls');
	if ( !Array.isArray(res.placeholder_urls) ) {
		res.placeholder_urls = [
			{
				'activ': true,
				'name': 'Plaintext: %title - %url' ,
				'action' : ''
			},
			{
				'activ': false,
				'name': 'HTML: <a href="%url">%title</a>' ,
				'action' : ''
			},
			{
				'activ': false,
				'name': 'Markdown: [%title](%url)' ,
				'action' : ''
			}
		]
		await browser.storage.local.set({ 'placeholder_urls': res.placeholder_urls });
	}
	res.placeholder_urls.forEach( (selector) => {
		selector.action = 'delete'
		createTableRow(selector);
	});
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);

