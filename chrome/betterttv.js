
window.addEventListener('message', function(event) {
	if (event.data.type === 'youtube-title-query') {
			var query = 'https://www.youtube.com/oembed?url='+event.data.url+'&format=json';
			
			var xhr = new XMLHttpRequest();
			xhr.open("GET", query, true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					try {
						var data = JSON.parse(xhr.responseText);
						
						window.postMessage({ type: 'youtube-title-response',
							url: event.data.url,
							id: event.data.id,
							title: data.title},
							'*'
						);
					}
					catch(e) {console.log('YouTube link lookup failed to parse.'); console.log(e);}
				}
			}
			xhr.send();
	}
});

function betterttv_init()
{
	script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = "//cdn.betterttv.net/betterttv.js?"+Math.random();
	thehead = document.getElementsByTagName('head')[0];
	if(thehead) thehead.appendChild(script);
}

betterttv_init();
