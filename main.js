// MediBook - simple front-end scripts
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ---------- Doctors page: search + filters ----------
if ($('#doctor-list')) {
    const search = $('#search');
    const form = $('#filter-form');
    const filters = $('#filters');
    const cards = $$('.doctor');

    function applyFilters() {
        const q = search.value.trim().toLowerCase();
        let shown = 0;

        cards.forEach((card) => {
            const matchText = !q || card.dataset.name.includes(q) || card.dataset.spec.toLowerCase().includes(q);
            const matchSpec = !$('#f-spec').value || card.dataset.spec === $('#f-spec').value;
            const matchLoc = !$('#f-loc').value || card.dataset.loc === $('#f-loc').value;
            const matchGender = !$('#f-gender').value || card.dataset.gender === $('#f-gender').value;
            const matchRating = parseFloat(card.dataset.rating) >= parseFloat($('#f-rating').value);
            const matchToday = !$('#f-today').checked || card.dataset.today === 'yes';

            const visible = matchText && matchSpec && matchLoc && matchGender && matchRating && matchToday;
            card.hidden = !visible;
            if (visible) shown++;
        });

        $('#result-count').textContent = shown + (shown === 1 ? ' doctor' : ' doctors');
        $('#no-results').hidden = shown !== 0;
    }

    search.addEventListener('input', applyFilters);
    form.addEventListener('input', applyFilters);
    form.addEventListener('reset', () => setTimeout(applyFilters, 0));

    // filters are always open on desktop, collapsed on small screens
    filters.open = window.innerWidth >= 900;

    // the navbar search icon links to doctors.html#search
    if (location.hash === '#search') search.focus();
}

// ---------- Doctor details: pick date and time ----------
const dateBtns = $$('.date-btn');
const timeBtns = $$('.time-btn');

function pick(buttons, btn, key, value) {
    buttons.forEach((b) => {
        b.classList.remove('selected');
        b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('selected');
    btn.setAttribute('aria-pressed', 'true');
    sessionStorage.setItem(key, value);
}

dateBtns.forEach((b) => b.addEventListener('click', () => pick(dateBtns, b, 'mbDate', b.dataset.date)));
timeBtns.forEach((b) => b.addEventListener('click', () => pick(timeBtns, b, 'mbTime', b.textContent.trim())));

// save the default selection too, so booking pages always have a date and time
if (dateBtns.length) {
    $('.date-btn.selected').click();
    $('.time-btn.selected').click();
}

// ---------- Booking + confirmation: show chosen date and time ----------
const savedDate = sessionStorage.getItem('mbDate');
const savedTime = sessionStorage.getItem('mbTime');
$$('[data-fill="date"]').forEach((el) => { if (savedDate) el.textContent = savedDate; });
$$('[data-fill="time"]').forEach((el) => { if (savedTime) el.textContent = savedTime; });

// ---------- Booking: form validation ----------
const bookingForm = $('#booking-form');

if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let allValid = true;

        function check(id, isValid, message) {
            const field = $('#' + id);
            const valid = isValid(field.value.trim());
            $('#' + id + '-error').textContent = valid ? '' : message;
            field.classList.toggle('invalid', !valid);
            if (!valid) allValid = false;
        }

        check('name', (v) => v.length >= 3, 'Enter your full name.');
        check('email', (v) => /^\S+@\S+\.\S+$/.test(v), 'Enter a valid email, like name@example.com.');
        check('phone', (v) => v.replace(/\D/g, '').length >= 10, 'Enter a phone number with at least 10 digits.');
        check('reason', (v) => v.length >= 5, 'Briefly tell us why you are visiting.');

        if (allValid) location.href = 'confirmation.html';
    });
}

// ---------- Appointments: Upcoming / Past tabs ----------
$$('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
        $$('.tab').forEach((t) => t.classList.remove('active'));
        $$('.tab-panel').forEach((p) => (p.hidden = true));
        tab.classList.add('active');
        $('#' + tab.dataset.tab).hidden = false;
    });
});
