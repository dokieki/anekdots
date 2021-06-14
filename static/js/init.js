function initDialog(dialog) {
    dialog.showModal();

    dialog.addEventListener('click', function(event) {
        let rect = event.target.getBoundingClientRect();

        if (rect.left > event.clientX || rect.right < event.clientX ||
            rect.top > event.clientY || rect.bottom < event.clientY) {
                dialog.classList.remove('opened');
                setTimeout(() => dialog.close(), 500);
        }
    });

    dialog.classList.add('opened')
}

async function loadAnekdots(tag, limit, offset = 0) {
	let anekdotsContainer = document.getElementById('anekdots');

	anekdotsContainer.innerHTML = '<div class="loading"><div></div></div>';

	let params = new URLSearchParams({
		category: tag,
		limit: limit,
		offset: offset
	});
	
	let anekdots = await fetch(`/api/v1/by_category?${params}`);
		anekdots = await anekdots.json();

	if (anekdots.length <= 0) {
		anekdotsContainer.innerHTML = 'Анекдоты по этому тегу кончились :(';

		return -1;
	}

	anekdotsContainer.innerHTML = '';

	console.log(anekdots)
	document.getElementById('pagination-count').innerHTML = anekdots.count;

	anekdots = anekdots.response;

	for (let anekdot of anekdots) {
		anekdotsContainer.innerHTML += `
		<div class="anekdot">
			<div class="anekdot-data">
				<span>${anekdot.content.replace(/\\n/g, '<br>')}</span>
			</div>
		</div>
		`;
	}

	return 1;
}

;(function() {
	if (typeof feather != 'undefined') feather.replace();

	window.currentTag = 1;
	window.currentPage = 1;
	window.currentOffset = 20;

	document.getElementById('pagination-next').onclick = async function() {
		++window.currentPage;

		if (loadAnekdots(window.currentTag, 20, window.currentOffset * window.currentPage) == -1) {
			--window.currentPage;

			loadAnekdots(window.currentTag, 20, window.currentOffset * window.currentPage);
		};
	}

	document.getElementById('pagination-back').onclick = async function() {
		--window.currentPage;

		if (window.currentPage < 1) {
			window.currentPage = 1;

			return -1;
		}

		loadAnekdots(window.currentTag, 20, window.currentOffset);
	}

	document.getElementById('random-anekdot-act').onclick = async function() {
		let response = await fetch('/api/v1/random');
		let anek = await response.json();
		let dialog = document.getElementById('random-anekdot');

		document.getElementById('random-anekdot-content').innerHTML = anek.response.content.replace(/\\n/g, '<br>');
		document.getElementById('random-anekdot-footer').innerHTML = `<div class="tag">${anek.response.category}</div>`;

		initDialog(dialog);
	}

	let tags = document.querySelectorAll('.tag.clickable');

	for (let tag of tags) {
		tag.onclick = async function() {
			let active = document.querySelectorAll('.tag.clickable.active');

			if (active.length >= 1) {
				active[0].classList.remove('active');
			}

			this.classList.add('active');

			window.currentTag = this.dataset.index;
			window.currentPage = 1;
			loadAnekdots(this.dataset.index, 20, window.currentPage, 0);
		}
	}
})();